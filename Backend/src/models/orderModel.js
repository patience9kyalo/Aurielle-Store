const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orderItems: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },
            price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
            image: { type: String, default: '' },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
        },  
    ],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true }, 
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        state: { type: String, required: true },
        phone: { type: String, required: true },
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'cash_on_delivery'],
        required: true,
        default: 'card',
    },
    paymentResult: {
        id: String,
        status: String,
        update_time: Date,
        email_address: String,
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Ready for Pickup', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    isDelivered: {
        type: Boolean,
        default: false,
    },
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
    isRefunded: {
        type: Boolean,
        default: false,
    },
    refundedAt: Date,
    trackingNumber: {
        type: String,
        trim: true,
    },
    carrier: {
        type: String,
        trim: true,
    },
    pickupNotifiedAt: Date,
    statusHistory: [
        {
            status: { type: String, required: true },
            updatedAt: { type: Date, default: Date.now },
            note: String,
        },
    ],
},
    {
        timestamps: true,
    }
)



orderSchema.index({ user: 1, createdAt: -1 })
orderSchema.index({ orderStatus: 1})

module.exports = mongoose.model('Order', orderSchema)