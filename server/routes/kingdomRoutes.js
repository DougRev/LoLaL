const express = require('express');
const router = express.Router();
const { getAllKingdoms, getKingdom, upgradeVault, depositGold, withdrawGold } = require('../controllers/kingdomController');
const { auth } = require('../middleware/auth');

// Fetch kingdom data and update gold and action points
router.get('/:id', auth, getKingdom);

// Route to fetch all kingdoms (for PvP list)
router.get('/', auth, getAllKingdoms);

// Route to upgrade the vault
router.post('/upgrades/upgrade-vault', auth, upgradeVault);

// Route to deposit gold into the vault
router.post('/vault/deposit', auth, depositGold);

// Route to withdraw gold from the vault
router.post('/vault/withdraw', auth, withdrawGold);

module.exports = router;
