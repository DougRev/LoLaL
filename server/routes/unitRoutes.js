const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getAllUnits,
  getAvailableUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
  purchaseUnit,
  assignUnit,
  reassignUnit,
} = require('../controllers/unitController');
const { auth, authorizeRoles } = require('../middleware/auth');

// Set up multer
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

// Public Routes
router.get('/', auth, getAllUnits);
router.get('/available', auth, getAvailableUnits);
router.get('/:id', auth, getUnitById);
router.post('/purchase', auth, purchaseUnit);
router.post('/assign', auth, assignUnit);
router.post('/reassign', auth, reassignUnit);

// Admin Routes (Create, Update, Delete)
router.post('/', auth, authorizeRoles('admin'), upload.single('image'), createUnit);
router.put('/:id', auth, authorizeRoles('admin'), upload.single('image'), updateUnit);
router.delete('/:id', auth, authorizeRoles('admin'), deleteUnit);

module.exports = router;
