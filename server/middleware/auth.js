const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.headers['x-auth-token'];
  console.log('Received token:', token);  // Log received token

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;  // Ensure decoded user is attached to req.user
    console.log('Decoded token user:', req.user);  // Log decoded user
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;
