const express = require('express')
const router = express.Router()
const {
  addReview,
  getReviews,
  getReviewsForProduct,
  getReviewById,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController')
const { protect, admin } = require('../middleware/authMiddleware')
const { validateZod } = require('../middleware/validateMiddleware')
const { reviewCreateValidator, reviewUpdateValidator } = require('../validators/reviewsValidator')

// Admin only
router.get('/', protect, getReviews)

// Public
router.get('/product/:productId', getReviewsForProduct)
router.get('/:id', getReviewById)

router.post('/',protect, validateZod(reviewCreateValidator), addReview)
router.put('/:id', validateZod(reviewUpdateValidator), updateReview)
router.delete('/:id', protect, deleteReview)

module.exports = router