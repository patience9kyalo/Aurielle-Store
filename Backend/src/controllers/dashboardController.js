const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const asyncHandler = require('express-async-handler')

const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD) || 5

//Inventory overview - stock levels, value, low-stock alerts (admin only)

const buildInventoryOverview = async () => {
    const totalProducts = await Product.countDocuments({})
    const outOfStock = await Product.countDocuments({ stock: 0 })

    const lowStockProducts = await Product.find({
        stock: { $gt: 0, $lte: LOW_STOCK_THRESHOLD },
    })
        .select('name stock price category')
        .populate('category', 'name')
        .sort({ stock: 1 })

    const [valueAgg] = await Product.aggregate([
        {
            $group: {
                _id: null,
                totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
                totalUnits: { $sum: '$stock' },
            },
        },
    ])

    const categoryBreakdown = await Product.aggregate([
        {
            $group: {
                _id: '$category',
                productCount: { $sum: 1 },
                totalStock: { $sum: '$stock' },
            },
        },
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'category',
            },
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 0,
                categoryId: '$_id',
                categoryName: '$category.name',
                productCount: 1,
                totalStock: 1,
            },
        },
        { $sort: { productCount: -1 } },
    ])

    return {
        totalProducts,
        outOfStockCount: outOfStock,
        lowStockThreshold: LOW_STOCK_THRESHOLD,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
        totalInventoryValue: valueAgg?.totalValue || 0,
        totalUnitsInStock: valueAgg?.totalUnits || 0,
        categoryBreakdown,
    }
}

const getInventoryOverview = asyncHandler(async (req, res) => {
    const data = await buildInventoryOverview()
    res.json({ success: true, data })
})

//Sales overview - revenue, order status, trends, top products (admin only)

const buildSalesOverview = async (days = 30) => {
    // "Real" sales exclude cancelled orders and anything never actually
    // paid (e.g. an abandoned COD order still sitting at Pending).
    const paidFilter = { isPaid: true, orderStatus: { $ne: 'Cancelled' } }

    const [totals] = await Order.aggregate([
        { $match: paidFilter },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$totalPrice' },
                totalOrders: { $sum: 1 },
                averageOrderValue: { $avg: '$totalPrice' },
            },
        },
    ])

    const statusBreakdown = await Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } },
    ])

    const since = new Date()
    since.setDate(since.getDate() - days)

    const revenueByDay = await Order.aggregate([
        { $match: { ...paidFilter, paidAt: { $gte: since } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
                revenue: { $sum: '$totalPrice' },
                orders: { $sum: 1 },
            },
        },
        { $project: { _id: 0, date: '$_id', revenue: 1, orders: 1 } },
        { $sort: { date: 1 } },
    ])

    const topProducts = await Order.aggregate([
        { $match: paidFilter },
        { $unwind: '$orderItems' },
        {
            $group: {
                _id: '$orderItems.product',
                name: { $first: '$orderItems.name' },
                unitsSold: { $sum: '$orderItems.quantity' },
                revenue: {
                    $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] },
                },
            },
        },
        { $sort: { unitsSold: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, product: '$_id', name: 1, unitsSold: 1, revenue: 1 } },
    ])

    const recentOrders = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name email')
        .select('user totalPrice orderStatus isPaid createdAt')

    const pendingFulfillment = await Order.countDocuments({
        isPaid: true,
        orderStatus: { $in: ['Pending', 'Processing'] },
    })

    return {
        totalRevenue: totals?.totalRevenue || 0,
        totalOrders: totals?.totalOrders || 0,
        averageOrderValue: totals?.averageOrderValue || 0,
        statusBreakdown,
        revenueByDay,
        topProducts,
        recentOrders,
        pendingFulfillment,
    }
}

const getSalesOverview = asyncHandler(async (req, res) => {
    const days = Number(req.query.days) || 30
    const data = await buildSalesOverview(days)
    res.json({ success: true, data })
})

//Combined inventory + sales overview in a single call (admin only)
//Runs both independently so a dashboard frontend only needs one request.

const getDashboardOverview = asyncHandler(async (req, res) => {
    const days = Number(req.query.days) || 30

    const [inventory, sales] = await Promise.all([
        buildInventoryOverview(),
        buildSalesOverview(days),
    ])

    res.json({
        success: true,
        data: { inventory, sales },
    })
})

module.exports = {
    getInventoryOverview,
    getSalesOverview,
    getDashboardOverview,
}