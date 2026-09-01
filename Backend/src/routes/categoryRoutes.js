const express = require('express');
const router = express.Router();
const {
  addCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateZod } = require('../middleware/validateMiddleware');
const { categorySchema } = require('../validators/categoryValidator');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', protect, validateZod(categorySchema), addCategory);

router.put(
  '/:id',
  protect,
  validateZod(categorySchema.partial()),
  updateCategory
);

router.delete('/:id', protect, deleteCategory);

module.exports = router;