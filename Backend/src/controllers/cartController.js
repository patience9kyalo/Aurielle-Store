const Cart = require('../models/cartModel')
const Product = require('../models/productModel')
const asyncHandler = require('express-async-handler')

// Finds the current user's cart, creating an empty one if it doesn't exist yet. 

const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId })
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] })
    }
    return cart
}

//Get the logged-in user's cart

const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
        'items.product',
        'name price discountPrice images stock isActive'
    )

    res.json({
        success: true,
        data: cart || { user: req.user._id, items: [] },
    })
})

const addToCart = asyncHandler(async (req, res) => {
    const { product: productId, quantity = 1 } = req.body

    const product = await Product.findById(productId)

    if (!product || !product.isActive) {
        res.status(404)
        throw new Error('Product not found')
    }

    const cart = await getOrCreateCart(req.user._id)

    const existingItem = cart.items.find(
        (item) => item.product && item.product.toString() === productId
    )

    const desiredQuantity = existingItem
        ? existingItem.quantity + quantity
        : quantity

    if (desiredQuantity > product.stock) {
        res.status(400)
        throw new Error(`Only ${product.stock} of this item left in stock`)
    }

    const currentPrice = product.discountPrice || product.price

    if (existingItem) {
        existingItem.quantity = desiredQuantity
        existingItem.priceAtAdd = currentPrice // refresh to current price
    } else {
        cart.items.push({
            product: productId,
            quantity,
            priceAtAdd: currentPrice,
        })
    }

    await cart.save()
    await cart.populate('items.product', 'name price discountPrice images stock isActive')

    res.status(200).json({
        success: true,
        data: cart,
        message: 'Item added to cart',
    })
})

const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body
    const { productId } = req.params

    const cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
        res.status(404)
        throw new Error('Cart not found')
    }

    const item = cart.items.find(
        (item) => item.product.toString() === productId
    )

    if (!item) {
        res.status(404)
        throw new Error('Item not found in cart')
    }

    const product = await Product.findById(productId)

    if (!product) {
        res.status(404)
        throw new Error('Product not found')
    }

    if (quantity > product.stock) {
        res.status(400)
        throw new Error(`Only ${product.stock} of this item left in stock`)
    }

    item.quantity = quantity

    await cart.save()
    await cart.populate('items.product', 'name price discountPrice images stock isActive')

    res.json({
        success: true,
        data: cart,
        message: 'Cart updated',
    })
})

const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params

    const cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
        res.status(404)
        throw new Error('Cart not found')
    }

    const itemExists = cart.items.some(
        (item) => item.product.toString() === productId
    )

    if (!itemExists) {
        res.status(404)
        throw new Error('Item not found in cart')
    }

    cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
    )

    await cart.save()
    await cart.populate('items.product', 'name price discountPrice images stock isActive')

    res.json({
        success: true,
        data: cart,
        message: 'Item removed from cart',
    })
})

//Clear the entire cart (e.g. after successful checkout)

const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id })

    if (cart) {
        cart.items = []
        await cart.save()
    }

    res.json({
        success: true,
        message: 'Cart cleared',
    })
})

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getOrCreateCart,
}