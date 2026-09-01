const cron = require('node-cron');
const Order = require('../models/orderModel');
const { emitOrderUpdate } = require('../socket')

const fetchCarrierStatus = async (trackingNumber, carrier) => {
    console.log(`[tracking-poll] Would check ${carrier || 'carrier'} for ${trackingNumber} (not yet implemented)`)
    return null
}

// Finds every order currently "Shipped" with a tracking number, checks
// each one against the (stubbed) carrier API, and updates + broadcasts
// anything that's changed.
const pollShippedOrders = async () => {
    const shippedOrders = await Order.find({
        orderStatus: 'Shipped',
        trackingNumber: { $exists: true, $ne: '' },
    })

    if (shippedOrders.length === 0) return

    console.log(`[tracking-poll] Checking ${shippedOrders.length} shipped order(s)...`)

    for (const order of shippedOrders) {
        try {
            const result = await fetchCarrierStatus(order.trackingNumber, order.carrier)
            if (!result) continue

            if (result.status === 'delivered') {
                order.orderStatus = 'Delivered'
                order.isDelivered = true
                order.deliveredAt = new Date()
            }

            order.statusHistory.push({
                status: order.orderStatus,
                updatedAt: new Date(),
                note: result.description || 'Carrier update',
            })

            await order.save()

            emitOrderUpdate(order.user.toString(), {
                orderId: order._id,
                orderStatus: order.orderStatus,
                trackingNumber: order.trackingNumber,
                carrier: order.carrier,
                statusHistory: order.statusHistory,
            })
        } catch (err) {
            console.error(`[tracking-poll] Failed to poll order ${order._id}:`, err.message)
        }
    }
}

// Default: every 15 minutes. Override with TRACKING_POLL_CRON in .env
// using standard cron syntax, e.g. '*/5 * * * *' for every 5 minutes.
const startTrackingPollJob = () => {
    const schedule = process.env.TRACKING_POLL_CRON || '*/15 * * * *'

    cron.schedule(schedule, () => {
        pollShippedOrders().catch((err) =>
            console.error('[tracking-poll] Job run failed:', err)
        )
    })

    console.log(`[tracking-poll] Scheduled (cron: "${schedule}")`)
}

module.exports = { startTrackingPollJob, pollShippedOrders }