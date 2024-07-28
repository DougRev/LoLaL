const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const factions = require('../models/Faction');
const Kingdom = require('../models/Kingdom');

dotenv.config();

const generateToken = (user) => {
  const payload = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    console.log('Register request received:', { name, email, password });

    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists');
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create a new kingdom for the user
    const kingdom = new Kingdom({
      user: user._id,
      name: `${user.name}'s Kingdom`,
      gold: 10000,  // Initial gold assigned to the kingdom
    });

    await kingdom.save();

    user.kingdom = kingdom._id.toString();
    await user.save();

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error('Error during registration:', err.message);
    res.status(500).send('Server error');
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email }).populate('kingdom');
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getUser = async (req, res) => {
  try {
    console.log('Fetching user with ID:', req.user.id);
    const user = await User.findById(req.user.id).select('-password').populate('kingdom');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    console.log('Fetched user:', user);
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send('Server error');
  }
};

const setFaction = async (req, res) => {
  const { factionName } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    const faction = factions.find(f => f.name === factionName);
    if (!faction) {
      return res.status(400).json({ msg: 'Invalid faction' });
    }

    user.faction = factionName;
    await user.save();

    // Create a new kingdom for the user if not already created
    if (!user.kingdom) {
      const kingdom = new Kingdom({
        user: user._id,
        name: `${user.name}'s Kingdom`,
        gold: 100,  // Initial gold assigned to the kingdom
      });

      await kingdom.save();
      user.kingdom = kingdom._id.toString();
      await user.save();
    }

    res.status(200).json({ msg: 'Faction selected successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getFactions = (req, res) => {
  res.json(factions);
};

const getUserArmy = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate({
      path: 'kingdom',
      populate: { path: 'army.unit' }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ army: user.kingdom.army });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getUser, setFaction, getFactions, getUserArmy };
