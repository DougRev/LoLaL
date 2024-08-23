const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { startPvPBattle, getPvPLog } = require('../controllers/pvpController');

// Route to initiate a PvP battle
router.post('/attack', auth, startPvPBattle);

// Optional: Get PvP log or results
router.get('/logs/:userId', auth, getPvPLog);

module.exports = router;
