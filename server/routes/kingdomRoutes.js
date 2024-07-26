const express = require('express');
const router = express.Router();
const { getKingdom } = require('../controllers/kingdomController');
const auth = require('../middleware/auth');

// Fetch kingdom data and update gold and action points
router.get('/:id', auth, getKingdom);

module.exports = router;
