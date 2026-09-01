const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const { validateZod } = require('../middleware/validateMiddleware');
const {
  addToCartValidator,
  updateCartItemValidator,
} = require('../validators/cartValidator');

router.use(protect);

router.get('/', getCart);
router.post('/', validateZod(addToCartValidator), addToCart);
router.put('/:productId', validateZod(updateCartItemValidator), updateCartItem);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;