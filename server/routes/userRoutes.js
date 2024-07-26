const express = require('express');
const router = express.Router();
const { register, login, getUser, setFaction, getFactions, getUserArmy } = require('../controllers/userController');
const auth = require('../middleware/auth');
const User = require('../models/User'); 

router.post('/register', register);
router.post('/login', login);
router.get('/user', auth, getUser); 
router.post('/setFaction', auth, setFaction);
router.get('/factions', getFactions);
router.get('/:userId/army', auth, getUserArmy);


// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('army.unit');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
