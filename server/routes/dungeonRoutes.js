const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth, authorizeRoles } = require('../middleware/auth');
const {
  getEligibleDungeons,
  getAllDungeons,
  createDungeon,
  updateDungeon,
  deleteDungeon,
  getDungeonById,
  battleDungeon
} = require('../controllers/dungeonController');

const { getAllRegions, getRegionDungeons } = require('../controllers/regionController');
const { getEligibleRegionsAndDungeons } = require('../controllers/dungeonController');

const upload = multer({ dest: 'uploads/' });

// Routes

// Get all dungeons the user is eligible to see
router.get('/eligible', auth, getEligibleRegionsAndDungeons);

// Get all regions (Admin only)
router.get('/all-regions', [auth, authorizeRoles('admin')], getAllRegions);

// Get all dungeons for a specific region
router.get('/region/:regionId', auth, getRegionDungeons);

// Get all dungeons for admin
router.get('/all', [auth, authorizeRoles('admin')], getAllDungeons);

// Get specific dungeon details
router.get('/:id', auth, getDungeonById);

// Create a new dungeon (Admin only)
router.post('/dungeons', [auth, authorizeRoles('admin'), upload.single('image')], createDungeon);

// Update a dungeon (Admin only)
router.put('/:id', [auth, authorizeRoles('admin'), upload.single('image')], updateDungeon);

// Delete a dungeon (Admin only)
router.delete('/:id', [auth, authorizeRoles('admin')], deleteDungeon);

// Battle a dungeon
router.post('/battle', auth, battleDungeon);

module.exports = router;
