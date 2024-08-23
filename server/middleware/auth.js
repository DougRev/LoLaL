const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const auth = async function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ msg: 'User not found, authorization denied' });
    }

    req.user.role = user.role; // Attach user role to the request object
    next();
  } catch (err) {
    console.error('Token error:', err);

    if (err.name === 'TokenExpiredError') {
      // Return a specific message and status indicating that the token has expired
      return res.status(401).json({ msg: 'Token expired', expired: true });
    }

    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Role-based middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

module.exports = { auth, authorizeRoles };
