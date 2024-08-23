const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth, authorizeRoles } = require('../middleware/auth');
const { createFaction, getFactions, getFactionById, updateFaction, deleteFaction } = require('../controllers/factionController');

// Set up multer for file upload handling
const upload = multer({ dest: 'uploads/' }); // Temporary storage

// Route for getting all factions
router.get('/', auth, getFactions);

// Route for getting a faction by ID
router.get('/:id', auth, getFactionById);

// Route for creating a faction (Admin only)
router.post('/', [auth, authorizeRoles('admin'), upload.single('image')], createFaction);

// Route for updating a faction by ID (Admin only)
router.put('/:id', [auth, authorizeRoles('admin'), upload.single('image')], updateFaction);

// Route for deleting a faction by ID (Admin only)
router.delete('/:id', [auth, authorizeRoles('admin')], deleteFaction);

module.exports = router;
