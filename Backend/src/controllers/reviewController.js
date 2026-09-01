const Review = require('../models/reviewModel')
const Product = require('../models/productModel')
const asyncHandler = require('express-async-handler')

const syncProductRating = async (productId) => {
    const product = await Product.findById(productId)
    if (!product) return

    const reviews = await Review.find({ product: productId })
    product.numOfReviews = reviews.length
    product.rating = reviews.length
        ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
        : 0

    await product.save()
}

const addReview = asyncHandler(async (req, res) => {

    const { product, rating, comment } = req.body

    const user = req.user._id

    const reviewExists = await Review.findOne({ product, user })

    if (reviewExists) {
        res.status(400)
        throw new Error('You have already reviewed this product')
    }

    const review = await Review.create({
        product,
        user,
        rating,
        comment
    })

    await syncProductRating(product)

    res.status(201).json({
        success: true,
        data: review,
        message: 'Review added successfully'
    })
})

const getReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({})
        .populate('user', 'name email')
        .populate('product', 'name')
    res.json({
        success: true,
        data: reviews,
    })
})

const getReviewsForProduct = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ product: req.params.productId })
        .populate('user', 'name')

    res.json({
        success: true,
        data: reviews,
    })
})

const getReviewById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate('product', 'name')

    if (!review) {
        res.status(404);
        throw new Error('Review not found')
    }

    res.json({
        success: true,
        data: review,
    })
})

const updateReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id)

    if (!review) {
        res.status(404);
        throw new Error('review not found')
    }

    review.rating = req.body.image ?? review.rating
    review.comment = req.body.parent ?? review.comment

    const updatedReview = await review.save();
    await syncProductRating(review.product)

    res.json({
        success: true,
        data: updatedReview,
        message: 'Review updated successfully',
    });
});

//Delete review 

const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        res.status(404);
        throw new Error('review not found');
    }

    const productId = review.product
    await review.deleteOne()
    await syncProductRating(productId)

    res.json({
        success: true,
        message: 'Review removed',
    })
})

module.exports = {
    addReview,
    getReviews,
    getReviewById,
    getReviewsForProduct,
    updateReview,
    deleteReview
}
