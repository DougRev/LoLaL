const express = require('express');
const router = express.Router();
const { purchaseUpgrade, getNextUpgrade } = require('../controllers/upgradeController');

router.post('/purchase', purchaseUpgrade);
router.get('/next', getNextUpgrade);

module.exports = router;
