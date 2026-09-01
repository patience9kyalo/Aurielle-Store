const express = require('express')
const router = express.Router()
const {
  getInventoryOverview,
  getSalesOverview,
  getDashboardOverview,
} = require('../controllers/dashboardController')
const { protect, admin } = require('../middleware/authMiddleware')
const cacheMiddleware = require('../middleware/cacheMiddleware')

router.use(protect, admin)

router.get('/overview', cacheMiddleware((req) => `dashboard:overview:${req.querydays || 30 }`, 300), getDashboardOverview)
router.get('/inventory', cacheMiddleware(() => 'dashboard:inventory', 300), getInventoryOverview)
router.get('/sales', cacheMiddleware((req) => `dashboard:sales:${req.query.days || 30}`, 300), getSalesOverview)

module.exports = router