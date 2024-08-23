const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Kingdom = require('../models/Kingdom');
const Faction = require('../models/Faction');
const { applyFactionModifiers } = require('../utils/factionModifiers');

dotenv.config();

// Generate JWT
const generateToken = (user) => {
  const payload = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
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
    // Verify the refresh token
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(401).json({ msg: 'User not found, authorization denied' });
    }

    // Generate a new access token
    const newAccessToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user); // Optionally refresh the refresh token

    res.json({ token: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error('Refresh token is not valid', err);
    return res.status(401).json({ msg: 'Token expired or not valid' });
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
    
        
    // Fetch additional user details, ensuring that stats and runeCollection are included
    user = await User.findById(user._id).populate('kingdom').populate('faction');

    res.json({ token, refreshToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Controller for fetching the current authenticated user's profile
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('kingdom')
      .populate('faction');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send('Server error');
  }
};

// Controller for updating the current authenticated user's profile
const updateProfile = async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findById(req.user.id);

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
};

// Admin Controller Logic Integrated Here
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const setFaction = async (req, res) => {
  const { factionName } = req.body;

  try {
    // Find the user and populate the associated kingdom
    const user = await User.findById(req.user.id).populate('kingdom');
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    // Find the requested faction by its name
    const faction = await Faction.findOne({ name: factionName });
    if (!faction) {
      return res.status(400).json({ msg: 'Invalid faction' });
    }

    // Update the user's faction
    user.faction = faction._id;

    // Update the kingdom's faction as well
    const kingdom = await Kingdom.findById(user.kingdom._id);
    if (!kingdom) {
      return res.status(400).json({ msg: 'Kingdom not found' });
    }
    kingdom.faction = faction._id;

    // Apply faction-specific stat modifications to the user and their kingdom
    applyFactionModifiers(user, kingdom, faction);

    // Save both the user and kingdom after applying modifiers
    await user.save();
    await kingdom.save();

    res.status(200).json({ msg: 'Faction selected successfully', user });
  } catch (err) {
    console.error('Error setting faction:', err.message);
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

module.exports = { register, login, getUser, updateProfile, setFaction, getFactions, getUserArmy, refreshToken, getAllUsers, updateUserRole, deleteUser };
