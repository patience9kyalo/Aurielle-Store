const Product = require('../models/productModel')
const asyncHandler = require('express-async-handler')
const cloudinary = require('../config/cloudinary')
const Review = require('../models/reviewModel')
const { deleteCacheByPattern } = require('../config/redis')

//Add new product

const addProduct = asyncHandler(async (req, res) => {
    const { name, description, price, stock, category, discountPrice, specifications } = req.body

    //handle image upload
    const images = []
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'products',
                width: 800,
                crop: 'scale',
            })

            images.push({
                public_id: result.public_id,
                url: result.secure_url,
            })

        }
    }

    const product = await Product.create({
        name,
        description,
        price,
        discountPrice,
        stock,
        category,
        specifications,
        images,
    })

    await deleteCacheByPattern('search:*')
    await deleteCacheByPattern('dashboard:*')

    res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully',
    })
})

// fetch products with filters

const filterProducts = asyncHandler(async (req, res) => {

    const pageSize = 12
    const page = Number(req.query.page) || 1

    // build query
    const keyword = req.query.keyword
        ? {
            $or: [
                { name: { $regex: req.query.keyword, $options: 'i' } },
                { description: { $regex: req.query.keyword, $options: 'i' } },
            ],
        }
        : {}

    const category = req.query.category ? { category: req.query.category } : {}

    const priceFilter = {}

    if (req.query.minPrice) priceFilter.$gte = Number(req.query.minPrice)
    if (req.query.maxPrice) priceFilter.$lte = Number(req.query.maxPrice)

    const query = {
        ...keyword,
        ...category,
        ...(Object.keys(priceFilter).length > 0 && { price: priceFilter }),
        isActive: true,
    }

    //get total count
    const count = await Product.countDocuments(query)

    //get products
    const products = awaitProduct.find(query)
        .populate('category', 'name')
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 })

    res.json({
        success: true,
        data: products,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    })
})

//Fetch all products

const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({})
    res.json(products)
})

//Fetch single product

const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('category', 'name')

    if (!product) {
        res.status(404)
        throw new Error('Product not found')
    }

    res.json({
        success: true,
        data: product,
    })
})

//Update product

const updateProduct = asyncHandler(async (req, res) => {

    const product = await Product.findById(req.params.id)

    if (!product) {
        res.status(404)
        throw new Error('Product not found')
    }

    if (
        req.user.role !== 'admin' &&
        product.seller.toString() !== req.user._id.toString()
    ) {
        res.status(403)
        throw new Error('Not authorized to update this product')
    }

    //update fields

    Object.assign(product, req.body)

    //handle new image uploads
    if (req.files && req.files.length > 0) {

        // delete old images from cloudinary
        for (const image of product.images) {
            await cloudinary.uploader.destroy(image.public_id)
        }

        // upload new images
        const images = []
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'products',
                width: 800,
                crop: 'scale',
            })

            images.push({
                public_id: result.public_id,
                url: result.secure_url,
            })
        }

        product.images = images
    }

    await product.save()

    await deleteCacheByPattern(`product:${product._id}`)
    await deleteCacheByPattern('search:*')
    await deleteCacheByPattern('dashboard:*')

    res.json({
        success: true,
        data: product,
        message: 'Product updated successfully',
    })
})

//Delete product

const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)

    if (!product) {
        res.status(404)
        throw new Error('Product not found')
    }

    if (
        req.user.role !== 'admin' &&
        product.seller.toString() !== req.user._id.toString()
    ) {
        res.status(403)
        throw new Error('Not authorized to delete this product')
    }

    //delete images from cloudinary

    for (const image of product.images) {
        await cloudinary.uploader.destroy(image.public_id)
    }

    await product.deleteOne()

    await deleteCacheByPattern(`product:${product._id}`)
    await deleteCacheByPattern('search:*')
    await deleteCacheByPattern('dashboard:*')

    res.json({
        success: true,
        message: 'Product deleted successfully',
    })
})

//create review

const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body

    const product = await Product.findById(req.params.id)

    if (!product) {
        res.status(404)
        throw new Error('Product not found')
    }

    // Check if user already reviewed

    const alreadyReviewed = await Review.findOne({
        product: req.params.id,
        user: req.user._id,
    })

    if (alreadyReviewed) {
        res.status(400)
        throw new Error('You have already reviewed this product')
    }

    const review = await Review.create({
        product: req.params.id,
        user: req.user._id,
        rating,
        comment,
    })

    // Update product rating
    const reviews = await Review.find({ product: req.params.id })
    product.numOfReviews = reviews.length
    product.rating =
        reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length

    await product.save()

    res.status(201).json({
        success: true,
        data: review,
        message: 'Review added successfully',
    })
})

module.exports = { getProducts, getProductById, addProduct, filterProducts, updateProduct, deleteProduct, createProductReview }