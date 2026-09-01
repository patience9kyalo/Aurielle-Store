const Order = require('../models/orderModel')
const Product = require('../models/productModel')
const stripe = require('../config/stripe')
const asyncHandler = require('express-async-handler')
const { emitOrderUpdate } = require('../socket')
const { sendSMS } = require('../utils/smsService')
const { deleteCacheByPattern } = require('../config/redis')

const pushStatusHistory = (order, status, note) => {
    order.statusHistory.push({ status, updatedAt: new Date(), note })
}

//Broadcast order

const broadcastOrderUpdate = (order) => {
    emitOrderUpdate(order.user.toString(), {
        orderId: order._id,
        orderStatus: order.orderStatus,
        isPaid: order.isPaid,
        isDelivered: order.isDelivered,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        statusHistory: order.statusHistory,
    })

    deleteCacheByPattern('dashboard:*')
}

//Create new order

const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body

    if (!orderItems || orderItems.length === 0) {
        res.status(400)
        throw new Error('No order items')
    } else if (paymentMethod === 'card') {
        res.status(400)
        throw new Error('Card orders must go through /api/orders/checkout, not this endpoint')
    } else {
        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            taxPrice,
            shippingPrice,
            totalPrice
        })

        pushStatusHistory(order, order.orderStatus, 'Order placed')

        const createdOrder = await order.save()
        res.status(201).json(createdOrder)
    }
})

//Get order by ID

const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')

    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }

    const isOwner = order.user._id.toString() === req.user._id.toString()
    if (!isOwner && req.user.role !== 'admin') {
        res.status(403)
        throw new Error('Not authorized to view this order')
    }

    res.json(order)
})

//Update order to paid

const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)

    if (order) {
        order.isPaid = true
        order.paidAt = Date.now()
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address
        }
        pushStatusHistory(order, order.orderStatus, 'Payment confirmed')
        const updatedOrder = await order.save()
        broadcastOrderUpdate(updatedOrder)
        res.json(updatedOrder)
    } else {
        res.status(404)
        throw new Error('Order not found')
    }
})

//Update order to delivered

const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)

    if (order) {
        order.isDelivered = true
        order.deliveredAt = Date.now()
        order.orderStatus = 'Delivered'
        pushStatusHistory(order, 'Delivered')
        const updatedOrder = await order.save()
        broadcastOrderUpdate(updatedOrder)
        res.json(updatedOrder)
    } else {
        res.status(404)
        throw new Error('Order not found')
    }

})

const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)

    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }

    order.orderStatus = req.body.orderStatus

    if (req.body.trackingNumber) {
        order.trackingNumber = req.body.trackingNumber
    }
    if (req.body.carrier) {
        order.carrier = req.body.carrier
    }

    pushStatusHistory(order, order.orderStatus, req.body.note)

    const updatedOrder = await order.save()
    broadcastOrderUpdate(updatedOrder)

    let smsWarning = null

    if (updatedOrder.orderStatus === 'Ready for Pickup' && !updatedOrder.pickupNotifiedAt) {
        try {
            await sendSMS(
                updatedOrder.shippingAddress.phone,
                `Hi! Your Aurielle Store order is ready for pickup. Order ID: ${updatedOrder._id}. See you soon!`
            )
            updatedOrder.pickupNotifiedAt = new Date()
            await updatedOrder.save()
        } catch (err) {
            console.error(`Pickup SMS failed for order ${updatedOrder._id}:`, err.message)
            smsWarning = `Status updated, but pickup SMS failed to send: ${err.message}`
        }
    }

    res.json({
        success: true,
        data: updatedOrder,
        message: 'Order status updated',
    })
})

const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .populate('orderItems.product', 'name price images')
        .sort({ createdAt: -1 });
    res.json(orders)
})

const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name')
    res.json(orders)
})

const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)

    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }

    const isOwner = order.user.toString() === req.user._id.toString()
    if (!isOwner && req.user.role !== 'admin') {
        res.status(403)
        throw new Error('Not authorized to cancel this order')
    }

    if (['Ready for Pickup', 'Shipped', 'Delivered', 'Cancelled'].includes(order.orderStatus)) {
        res.status(400)
        throw new Error(`Order cannot be cancelled once it is ${order.orderStatus}`)
    }

    let refundIssued = false
    let refundError = null

    // Only card orders that were actually charged need a refund + restock.
    // COD orders were never paid and never decremented stock, so cancelling
    // one is just a status change.
    if (order.paymentMethod === 'card' && order.isPaid && order.paymentResult?.id) {
        try {
            await stripe.refunds.create({
                payment_intent: order.paymentResult.id,
            })
            refundIssued = true
        } catch (err) {
            // Don't block cancellation on a refund failure (e.g. already
            // refunded, or a Stripe-side issue) - log it and surface it in
            // the response so an admin can follow up manually.
            console.error(`Refund failed for order ${order._id}:`, err.message)
            refundError = err.message
        }

        // Restock regardless of refund outcome - the customer is not
        // getting the items either way.
        for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity },
            })
        }

        await deleteCacheByPattern('product:*')
        await deleteCacheByPattern('search:*')
    }

    order.orderStatus = 'Cancelled'
    order.cancelledAt = new Date()
    order.cancelReason = req.body.reason || undefined
    pushStatusHistory(order, 'Cancelled', req.body.reason)
    if (refundIssued) {
        order.isRefunded = true
        order.refundedAt = new Date()
    }

    const updatedOrder = await order.save()
    broadcastOrderUpdate(updatedOrder)

    res.json({
        success: true,
        data: updatedOrder,
        message: refundError
            ? `Order cancelled, but refund failed: ${refundError}. Please refund manually via Stripe.`
            : 'Order cancelled successfully',
    })
})

const getOrderTracking = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).select(
        'user orderStatus statusHistory trackingNumber carrier isPaid paidAt isDelivered deliveredAt cancelledAt cancelReason'
    );

    if (!order) {
        res.status(404)
        throw new Error('Order not found')
    }

    const isOwner = order.user.toString() === req.user._id.toString()
    if (!isOwner && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view this order')
    }

    res.json({
        success: true,
        data: {
            orderId: order._id,
            orderStatus: order.orderStatus,
            isPaid: order.isPaid,
            paidAt: order.paidAt,
            isDelivered: order.isDelivered,
            deliveredAt: order.deliveredAt,
            cancelledAt: order.cancelledAt,
            cancelReason: order.cancelReason,
            trackingNumber: order.trackingNumber,
            carrier: order.carrier,
            statusHistory: order.statusHistory,
        },
    })
})

module.exports = {
    addOrderItems,
    getOrderById,
    getOrderTracking,
    updateOrderToPaid,
    updateOrderToDelivered,
    updateOrderStatus,
    getMyOrders,
    getOrders,
    cancelOrder
}