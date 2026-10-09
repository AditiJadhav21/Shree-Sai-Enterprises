const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'shree_sai_enterprises_super_secret_jwt_key_2024', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
    }
    req.user = user;
    next();
  });
}

module.exports = {
  authenticateToken
};
