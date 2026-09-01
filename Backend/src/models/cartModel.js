const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1,
    },
    priceAtAdd: {
        type: Number,
        required: true,
    },
}, { _id: false })

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // one cart per user
    },
    items: [cartItemSchema],
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

cartSchema.virtual('totalItems').get(function () {
    return this.items.reduce((acc, item) => acc + item.quantity, 0)
})

cartSchema.virtual('subtotal').get(function () {
    return this.items.reduce(
        (acc, item) => acc + item.quantity * item.priceAtAdd,
        0
    )
})

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart

