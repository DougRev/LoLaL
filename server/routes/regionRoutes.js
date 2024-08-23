const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/auth');
const regionController = require('../controllers/regionController');

// Get all regions (Admin only)
router.get('/all', [auth, authorizeRoles('admin')], regionController.getAllRegions);

// Get regions accessible to the user
router.get('/', auth, regionController.getAccessibleRegions);

// Get dungeons for a specific region
router.get('/:regionId/dungeons', auth, regionController.getRegionDungeons);

// Admin Routes (Create, Update, Delete)
router.post('/', [auth, authorizeRoles('admin')], regionController.createRegion);
router.put('/:id', [auth, authorizeRoles('admin')], regionController.updateRegion);
router.delete('/:id', [auth, authorizeRoles('admin')], regionController.deleteRegion);

module.exports = router;
