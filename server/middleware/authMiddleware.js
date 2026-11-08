const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'skillnest_jwt_secret_key_member01_bandara_2026'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists.',
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authorization token.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.',
    });
  }
};

// Optional auth: attaches user if token is present, continues without error if not
const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'skillnest_jwt_secret_key_member01_bandara_2026'
      );
      const user = await User.findById(decoded.id).select('-password');
      if (user) req.user = user;
    } catch (err) {
      // Continue without user
    }
  }
  next();
};

/**
 * Role-based authorization guard
 * Supports standard roles ('admin', 'administrator', 'instructor', 'learner')
 */
const authorize = (...roles) => {
  const allowedRoles = [...roles];
  if (roles.includes('admin') && !allowedRoles.includes('administrator')) allowedRoles.push('administrator');
  if (roles.includes('administrator') && !allowedRoles.includes('admin')) allowedRoles.push('admin');

  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user?.role || 'unassigned'}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, optionalProtect, authorize };

