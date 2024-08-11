const express = require('express');
const router = express.Router();
const { register, login, getUser, setFaction, getFactions, getUserArmy, refreshToken, } = require('../controllers/userController');
const auth = require('../middleware/auth');
const User = require('../models/User'); 

router.post('/register', register);
router.post('/login', login);
router.get('/user', auth, getUser); 
router.post('/setFaction', auth, setFaction);
router.get('/factions', getFactions);
router.get('/:userId/army', auth, getUserArmy);
router.post('/refresh', refreshToken);


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

// Update user's profile information
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if they are provided
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error('Error updating user profile:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Update user's password
router.put('/:id/password', auth, async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash the new password and update the user's password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err.message);
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
