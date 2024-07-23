const express = require('express');
const router = express.Router();
const { register, login, getUser, setFaction, getFactions } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/user', auth, getUser); 
router.post('/setFaction', auth, setFaction);
router.get('/factions', getFactions);

module.exports = router;
