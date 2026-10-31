const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check HTTP-only cookie
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(res, 401, 'Access denied. No token provided.', []);
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Token has expired. Please log in again.', []);
      }
      return sendError(res, 401, 'Invalid token. Please log in again.', []);
    }

    // Fetch user (exclude password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 401, 'User no longer exists.', []);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 500, 'Authentication error', []);
  }
};

module.exports = { protect };
