const express = require('express')
const router = express.Router()
const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  filterProducts
} = require('../controllers/productController')
const { searchProducts, autocompleteProducts } = require('../controllers/searchController')
const { protect, admin } = require('../middleware/authMiddleware')
const { validateZod } = require('../middleware/validateMiddleware')
const upload = require('../middleware/uploadMiddleware')
const cacheMiddleware = require('../middleware/cacheMiddleware')
const { productSchema, reviewValidator,} = require('../validators/productValidator')

router.get('/search', cacheMiddleware((req) => `search:${JSON.stringify(req.query)}`, 60), searchProducts);
router.get('/autocomplete', autocompleteProducts);

// Public routes
router.get('/', getProducts)
router.get('/:id', cacheMiddleware((req) => `product:${req.params.id}`, 300), getProductById)

// Protected routes
router.post('/:id/reviews', protect, validateZod(reviewValidator), createProductReview)

// Admin/Seller routes
router.post(
  '/',
  protect,
  upload.array('images', 5),
  validateZod(productSchema),
  addProduct
)

router.put(
  '/:id',
  protect,
  upload.array('images', 5),
  validateZod(productSchema.partial()),
  updateProduct
)

router.delete('/:id', protect, deleteProduct)

module.exports = router