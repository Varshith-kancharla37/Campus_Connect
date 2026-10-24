const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id || !decoded.role || !decoded.username) {
      return res.status(401).json({ status: 'error', message: 'Invalid token payload' });
    }
    req.user = {
      _id: decoded.id,
      club: decoded.club,
      role: decoded.role,
      username: decoded.username
    };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
};

module.exports = auth;