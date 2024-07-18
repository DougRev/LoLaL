const adminAuth = (req, res, next) => {
    console.log('Admin Middleware: Checking user role:', req.user);
    if (req.user && req.user.role === 'admin') {
      console.log('Admin Middleware: User is admin, proceeding to next middleware');
      next();
    } else {
      console.log('Admin Middleware: Access denied, user is not admin');
      res.status(403).json({ msg: 'Access denied: Admins only' });
    }
  };
  
  module.exports = adminAuth;
  