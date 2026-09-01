const mongoose = require('mongoose')
const Product = require('../models/productModel')
const asyncHandler = require('express-async-handler')

const SEARCH_INDEX = 'products_index'

const searchProducts = asyncHandler(async (req, res) => {
    const { q, category, minPrice, maxPrice, inStock } = req.query
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Number(req.query.limit) || 12, 50)

    const filter = [{ equals: { path: 'isActive', value: true } }]

    if (category) {
        filter.push({ equals: { path: 'category', value: new mongoose.Types.ObjectId(category) } })
    }

    if (minPrice || maxPrice) {
        const range = { path: 'price' }
        if (minPrice) range.gte = Number(minPrice)
        if (maxPrice) range.lte = Number(maxPrice)
        filter.push({ range })
    }

    if (inStock === 'true') {
        filter.push({ range: { path: 'stock', gt: 0 } })
    }

    const compound = { filter }

    // Only add a text clause if there's an actual search term - an empty
    // "must" with just filters still works fine as a filtered browse.
    if (q && q.trim()) {
        compound.must = [
            {
                text: {
                    query: q.trim(),
                    path: ['name', 'description'],
                    fuzzy: { maxEdits: 2, prefixLength: 2 }, // tolerates ~2 typos
                },
            },
        ]
    }

    const pipeline = [
        {
            $search: {
                index: SEARCH_INDEX,
                compound,
            },
        },
        { $addFields: { score: { $meta: 'searchScore' } } },
        { $sort: { score: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category',
            },
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                name: 1,
                description: 1,
                price: 1,
                discountPrice: 1,
                stock: 1,
                images: 1,
                rating: 1,
                category: { _id: 1, name: 1 },
                score: 1,
            },
        },
    ]

    const products = await Product.aggregate(pipeline)

    res.json({
        success: true,
        data: products,
        page,
        query: q || null,
    })
})

const autocompleteProducts = asyncHandler(async (req, res) => {
    const { q } = req.query

    if (!q || q.trim().length < 2) {
        return res.json({ success: true, data: [] })
    }

    const pipeline = [
        {
            $search: {
                index: SEARCH_INDEX,
                autocomplete: {
                    query: q.trim(),
                    path: 'name',
                },
            },
        },
        { $match: { isActive: true } },
        { $limit: 8 },
        { $project: { name: 1, price: 1, discountPrice: 1 } },
    ]

    const suggestions = await Product.aggregate(pipeline)

    res.json({ success: true, data: suggestions })
})

module.exports = {
    searchProducts,
    autocompleteProducts,
}