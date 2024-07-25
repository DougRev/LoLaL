const express = require('express');
const { getKingdom } = require('../controllers/kingdomController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/:id', auth, getKingdom);

module.exports = router;
