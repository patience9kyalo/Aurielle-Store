const express = require('express')
const router = express.Router()
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
} = require('../controllers/wishlistController')
const { protect } = require('../middleware/authMiddleware')
const { validateZod } = require('../middleware/validateMiddleware')
const { addToWishlistValidator, moveToCartValidator, } = require('../validators/wishlistValidator')

router.use(protect)

router.get('/', getWishlist)
router.post('/', validateZod(addToWishlistValidator), addToWishlist)
router.delete('/:productId', removeFromWishlist)
router.delete('/', clearWishlist)
router.post('/:productId/move-to-cart', validateZod(moveToCartValidator), moveToCart)

module.exports = router