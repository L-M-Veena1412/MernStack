const { verifyAccessToken } = require('../utils/token');

// ✅ Middleware: authenticate user
function authenticate(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const payload = verifyAccessToken(token);
    req.user = payload; // { id, email, role, ... }
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

// ✅ Middleware: require admin role
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}

module.exports = { authenticate, requireAdmin };
