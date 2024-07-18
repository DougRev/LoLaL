const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.headers['x-auth-token'];
  console.log('Auth Middleware: Received token:', token);

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    console.log('Auth Middleware: Decoded token user:', req.user);
    next();
  } catch (err) {
    console.error('Auth Middleware: Token verification failed:', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;
