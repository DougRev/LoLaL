const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Kingdom = require('../models/Kingdom');
const Faction = require('../models/Faction');

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
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' }); // Short-lived access token
};

const generateRefreshToken = (user) => {
  const payload = {
    user: {
      id: user.id,
    },
  };
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); // Longer-lived refresh token
};

const refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(401).json({ msg: 'User not found, authorization denied' });
    }

    const newAccessToken = generateToken(user);
    res.json({ token: newAccessToken });
  } catch (err) {
    console.error('Refresh token is not valid', err);
    res.status(401).json({ msg: 'Token expired or not valid' });
  }
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

    // Save the user
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

    const token = generateToken(user); // Generate after user creation
    const refreshToken = generateRefreshToken(user); // Generate after user creation
    res.json({ token, refreshToken });
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

    const token = generateToken(user); // Generate after validation
    const refreshToken = generateRefreshToken(user); // Generate after validation
    res.json({ token, refreshToken });
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

    const faction = await Faction.findOne({ name: factionName });
    if (!faction) {
      return res.status(400).json({ msg: 'Invalid faction' });
    }

    user.faction = faction._id; // Use faction ID instead of name
    await user.save();

    res.status(200).json({ msg: 'Faction selected successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getFactions = async (req, res) => {
  try {
    const factions = await Faction.find();
    res.json(factions);
  } catch (error) {
    console.error('Error fetching factions:', error);
    res.status(500).send('Server error');
  }
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

module.exports = { register, login, getUser, setFaction, getFactions, getUserArmy, refreshToken };
