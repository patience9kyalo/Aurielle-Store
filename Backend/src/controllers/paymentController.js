const stripe = require('../config/stripe')
const Cart = require('../models/cartModel')
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const asyncHandler = require('express-async-handler')
const { emitOrderUpdate } = require('../socket')
const { deleteCacheByPattern } = require('../config/redis')

const TAX_RATE = Number(process.env.TAX_RATE) || 0
const SHIPPING_PRICE = Number(process.env.SHIPPING_PRICE) || 0
const CURRENCY = process.env.STRIPE_CURRENCY || 'Kes'
const CLIENT_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

const createCheckoutSession = asyncHandler(async (req, res) => {
    const shippingAddress = req.body // validated by shippingAddressValidator

    const cart = await Cart.findOne({ user: req.user._id }).populate(
        'items.product'
    )

    if (!cart || cart.items.length === 0) {
        res.status(400)
        throw new Error('Your cart is empty')
    }

    // Re-verify every item against live product data - stock, active
    // status, and current price - rather than trusting the cart snapshot.
    const lineItems = []
    let itemsPrice = 0

    for (const item of cart.items) {
        const product = item.product

        if (!product || !product.isActive) {
            res.status(400)
            throw new Error(`"${item.product?.name ?? 'A product'}" in your cart is no longer available`)
        }

        if (item.quantity > product.stock) {
            res.status(400)
            throw new Error(`Only ${product.stock} of "${product.name}" left in stock`)
        }

        const unitPrice = product.discountPrice || product.price
        itemsPrice += unitPrice * item.quantity

        lineItems.push({
            price_data: {
                currency: CURRENCY,
                product_data: {
                    name: product.name,
                    images: product.images?.[0]?.url ? [product.images[0].url] : undefined,
                },
                unit_amount: Math.round(unitPrice * 100), // Stripe uses the smallest currency unit
            },
            quantity: item.quantity,
        })
    }

    const taxPrice = Number((itemsPrice * TAX_RATE).toFixed(2))
    const shippingPrice = SHIPPING_PRICE

    if (taxPrice > 0) {
        lineItems.push({
            price_data: {
                currency: CURRENCY,
                product_data: { name: 'Tax' },
                unit_amount: Math.round(taxPrice * 100),
            },
            quantity: 1,
        })
    }

    if (shippingPrice > 0) {
        lineItems.push({
            price_data: {
                currency: CURRENCY,
                product_data: { name: 'Shipping' },
                unit_amount: Math.round(shippingPrice * 100),
            },
            quantity: 1,
        })
    }

    const itemsMetadata = JSON.stringify(
        cart.items.map((item) => ({ p: item.product._id.toString(), q: item.quantity }))
    )

    if (itemsMetadata.length > 480) {
        // Stripe metadata values are capped at 500 chars. Large carts need
        // a different approach.
        res.status(400)
        throw new Error('Cart has too many distinct items to check out at once. Please reduce the number of items.')
    }

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: req.user.email,
        line_items: lineItems,
        success_url: `${CLIENT_URL}/orders?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${CLIENT_URL}/cart`,
        metadata: {
            userId: req.user._id.toString(),
            shippingAddress: JSON.stringify(shippingAddress),
            items: itemsMetadata,
            taxPrice: taxPrice.toFixed(2),
            shippingPrice: shippingPrice.toFixed(2),
        },
    })

    res.json({
        success: true,
        data: { url: session.url },
    })
})

const stripeWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers['stripe-signature']
    let event

    try {

        const rawPayload = req.rawBody || req.body

        event = stripe.webhooks.constructEvent(
            rawPayload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (err) {
        console.error('Stripe webhook signature verification failed:', err.message)
        return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object

        try {
            await handleCheckoutCompleted(session)
        } catch (err) {
            console.error('Failed to process checkout.session.completed:', err)
        }
    }

    res.json({ received: true })
})

const handleCheckoutCompleted = async (session) => {
    const paymentIntentId = session.payment_intent

    // Idempotency: Stripe can send the same event more than once.
    const alreadyProcessed = await Order.findOne({ 'paymentResult.id': paymentIntentId })
    if (alreadyProcessed) {
        console.log(`Order already created for payment_intent ${paymentIntentId}, skipping.`)
        return
    }

    const { userId, shippingAddress, items, taxPrice, shippingPrice } = session.metadata
    const parsedAddress = JSON.parse(shippingAddress)
    const parsedItems = JSON.parse(items) // [{ p: productId, q: quantity }]

    const orderItems = []
    let itemsPrice = 0

    for (const { p: productId, q: quantity } of parsedItems) {
        const product = await Product.findById(productId)

        if (!product) {
            console.error(`Product ${productId} not found while building order from session ${session.id}`)
            continue
        }

        const price = product.discountPrice || product.price
        itemsPrice += price * quantity

        orderItems.push({
            product: product._id,
            name: product.name,
            quantity,
            price,
            image: product.images?.[0]?.url || '',
        })

        product.stock = Math.max(0, product.stock - quantity)
        await product.save()
    }

    const totalPrice = (session.amount_total || 0) / 100

    const createdOrder = await Order.create({
        user: userId,
        orderItems,
        shippingAddress: parsedAddress,
        paymentMethod: 'card',
        itemsPrice,
        taxPrice: Number(taxPrice) || 0,
        shippingPrice: Number(shippingPrice) || 0,
        totalPrice,
        isPaid: true,
        paidAt: new Date(),
        paymentResult: {
            id: paymentIntentId,
            status: session.payment_status,
            update_time: new Date(),
            email_address: session.customer_details?.email,
        },
        statusHistory: [
            { status: 'Pending', updatedAt: new Date(), note: 'Order placed and payment confirmed' },
        ],
    })

    emitOrderUpdate(userId, {
        orderId: createdOrder._id,
        orderStatus: createdOrder.orderStatus,
        isPaid: createdOrder.isPaid,
        isDelivered: createdOrder.isDelivered,
        trackingNumber: createdOrder.trackingNumber,
        carrier: createdOrder.carrier,
        statusHistory: createdOrder.statusHistory,
    })

    await deleteCacheByPattern('dashboard:*')
    await deleteCacheByPattern('search:*')
    await deleteCacheByPattern('product:*')

    await Cart.findOneAndUpdate({ user: userId }, { items: [] })
}

module.exports = {
    createCheckoutSession,
    stripeWebhook,
}