const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getUser,
  updateProfile,
  setFaction,
  getFactions,
  getUserArmy,
  refreshToken,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require('../controllers/userController');
const { auth, authorizeRoles } = require('../middleware/auth');

// Authentication Routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// User Routes
router.get('/user', auth, getUser);

// User Profile Routes
router.get('/profile', auth, getUser); // Get the current authenticated user’s profile
router.put('/profile', auth, updateProfile); // Update the current authenticated user’s profile

// Faction Routes
router.post('/set-faction', auth, setFaction);
router.get('/factions', getFactions);

// Army Routes
router.get('/:userId/army', auth, getUserArmy);

// Admin Routes (Protected by role middleware)
router.get('/admin/users', auth, authorizeRoles('admin'), getAllUsers);
router.put('/admin/users/:id', auth, authorizeRoles('admin'), updateUserRole);
router.delete('/admin/users/:id', auth, authorizeRoles('admin'), deleteUser);

module.exports = router;
