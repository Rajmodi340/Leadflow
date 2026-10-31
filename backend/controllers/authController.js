const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

const setCookieAndRespond = (res, statusCode, message, user, token) => {
  // Set HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return sendSuccess(res, statusCode, message, { user, token });
};

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return sendError(res, 409, 'Email already registered', [
        { field: 'email', message: 'This email is already in use' },
      ]);
    }

    const user = await User.create({ name: name.trim(), email, password });
    const token = generateToken(user._id);

    return setCookieAndRespond(res, 201, 'Registration successful', user, token);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user WITH password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid credentials', [
        { field: 'email', message: 'No account found with this email' },
      ]);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid credentials', [
        { field: 'password', message: 'Incorrect password' },
      ]);
    }

    const token = generateToken(user._id);
    // Remove password from response
    user.password = undefined;

    return setCookieAndRespond(res, 200, 'Login successful', user, token);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return sendSuccess(res, 200, 'User retrieved', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  return sendSuccess(res, 200, 'Logged out successfully', {});
};

module.exports = { register, login, getMe, logout };
