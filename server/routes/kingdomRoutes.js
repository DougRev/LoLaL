const express = require('express');
const router = express.Router();
const { getKingdom, upgradeVault, depositGold, withdrawGold } = require('../controllers/kingdomController'); // Import the functions
const auth = require('../middleware/auth');

// Fetch kingdom data and update gold and action points
router.get('/:id', auth, getKingdom);

// Route to upgrade the vault
router.post('/upgrades/upgrade-vault', auth, upgradeVault);

// Route to deposit gold into the vault
router.post('/vault/deposit', auth, depositGold);

// Route to withdraw gold from the vault
router.post('/vault/withdraw', auth, withdrawGold);

module.exports = router;
