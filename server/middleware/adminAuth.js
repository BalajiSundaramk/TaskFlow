const jwt = require('jsonwebtoken');

const JWT_SECRET = 'taskflow_secret_key_2024';

function adminAuth(req, res, next) {
  const decoded = req.user;
  if (!decoded) {
    return res.status(401).json({ error: 'Access denied' });
  }

  if (decoded.is_admin !== 1 && decoded.is_admin !== true) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  req.user = decoded;
  next();
}

module.exports = adminAuth;
