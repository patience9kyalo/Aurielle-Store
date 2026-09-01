const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validateZod } = require('../middleware/validateMiddleware');
const { registerValidator, loginValidator } = require('../validators/userValidator');
const {
  registerUser,
  authUser,
  getUserProfile,
  getUsers,
  getUserById,
  logoutUser,
  updateUserProfile,
  deleteUser
} = require('../controllers/authController');

// Public routes
router.post('/register', validateZod(registerValidator), registerUser);
router.post('/login', validateZod(loginValidator), authUser);

// Protected routes

router.get('/',protect, getUsers)

router.get('/me', protect, getUserProfile);
router.post('/logout', logoutUser);

router.get('/:_id',protect,  getUserById)

router.put('/:_id',protect, updateUserProfile)

router.delete('/:_id', protect, deleteUser)

module.exports = router;