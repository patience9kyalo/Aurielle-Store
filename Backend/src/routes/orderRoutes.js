const express = require('express')
const {
    addOrderItems,
    getOrderById,
    getOrderTracking,
    updateOrderToPaid,
    updateOrderToDelivered,
    updateOrderStatus,
    getMyOrders,
    getOrders,
    cancelOrder
} = require('../controllers/orderController')
const { createCheckoutSession } = require('../controllers/paymentController')
const { protect, admin } = require('../middleware/authMiddleware')
const { validateZod } = require('../middleware/validateMiddleware')
const {
    createOrderValidator,
    updateOrderStatusValidator,
    shippingAddressValidator,
} = require('../validators/orderValidator')

const router = express.Router()

// Every order route requires a logged-in user.
router.use(protect)

router.post('/checkout', validateZod(shippingAddressValidator), createCheckoutSession)
router.post('/', validateZod(createOrderValidator), addOrderItems)
router.get('/myorders', getMyOrders)
router.put('/:id/cancel', cancelOrder)
router.get('/:id/track', getOrderTracking)
router.get('/:id', getOrderById) // ownership/admin check happens inside the controller

// Admin only
router.get('/', protect, getOrders)
router.put('/:id/pay', protect, updateOrderToPaid)
router.put('/:id/deliver', protect, updateOrderToDelivered)
router.put('/:id/status', protect, validateZod(updateOrderStatusValidator), updateOrderStatus)



module.exports = router