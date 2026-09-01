const Wishlist = require('../models/wishlistModel')
const Product = require('../models/productModel')
const { getOrCreateCart } = require('./cartController')
const asyncHandler = require('express-async-handler')

const getOrCreateWishlist = async (userId) => {
    let wishlist = await Wishlist.findOne({ user: userId })
    if (!wishlist) {
        wishlist = await Wishlist.create({ user: userId, items: [] })
    }
    return wishlist
}

//Get the logged-in user's wishlist

const getWishlist = asyncHandler(async (req, res) => {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
        'items.product',
        'name price discountPrice images stock isActive'
    )

    res.json({
        success: true,
        data: wishlist || { user: req.user._id, items: [] },
    })
})

//Add a product to the wishlist

const addToWishlist = asyncHandler(async (req, res) => {
    const { product: productId } = req.body

    const product = await Product.findById(productId)
    if (!product || !product.isActive) {
        res.status(404)
        throw new Error('Product not found')
    }

    const wishlist = await getOrCreateWishlist(req.user._id)

    const alreadySaved = wishlist.items.some(
        (item) => item.product.toString() === productId
    )

    if (!alreadySaved) {
        wishlist.items.push({ product: productId })
        await wishlist.save()
    }

    await wishlist.populate('items.product', 'name price discountPrice images stock isActive')

    res.status(200).json({
        success: true,
        data: wishlist,
        message: alreadySaved ? 'Already in your wishlist' : 'Added to wishlist',
    })
})

//Remove a single product from the wishlist

const removeFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params

    const wishlist = await Wishlist.findOne({ user: req.user._id })

    if (!wishlist) {
        res.status(404)
        throw new Error('Wishlist not found')
    }

    wishlist.items = wishlist.items.filter(
        (item) => item.product.toString() !== productId
    )

    await wishlist.save()
    await wishlist.populate('items.product', 'name price discountPrice images stock isActive')

    res.json({
        success: true,
        data: wishlist,
        message: 'Removed from wishlist',
    })
})

//Clear the entire wishlist

const clearWishlist = asyncHandler(async (req, res) => {
    const wishlist = await Wishlist.findOne({ user: req.user._id })

    if (wishlist) {
        wishlist.items = []
        await wishlist.save()
    }

    res.json({
        success: true,
        message: 'Wishlist cleared',
    })
})

//Move a wishlist item into the cart (removes it from the wishlist too)

const moveToCart = asyncHandler(async (req, res) => {
    const { productId } = req.params
    const quantity = Number(req.body.quantity) || 1

    const product = await Product.findById(productId)
    if (!product || !product.isActive) {
        res.status(404)
        throw new Error('Product not found')
    }

    if (quantity > product.stock) {
        res.status(400)
        throw new Error(`Only ${product.stock} of this item left in stock`)
    }

    const cart = await getOrCreateCart(req.user._id)
    const currentPrice = product.discountPrice || product.price

    const existingCartItem = cart.items.find(
        (item) => item.product.toString() === productId
    )

    if (existingCartItem) {
        existingCartItem.quantity += quantity
        existingCartItem.priceAtAdd = currentPrice
    } else {
        cart.items.push({ product: productId, quantity, priceAtAdd: currentPrice })
    }

    await cart.save()

    const wishlist = await Wishlist.findOne({ user: req.user._id })
    if (wishlist) {
        wishlist.items = wishlist.items.filter(
            (item) => item.product.toString() !== productId
        )
        await wishlist.save()
    }

    await cart.populate('items.product', 'name price discountPrice images stock isActive')

    res.json({
        success: true,
        data: cart,
        message: 'Moved to cart',
    })
})

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    moveToCart,
}