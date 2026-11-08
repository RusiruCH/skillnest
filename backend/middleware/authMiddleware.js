const jwt = require('jsonwebtoken');

/**
 * ============================================================================
 * AUTHENTICATION & AUTHORIZATION INTEGRATION CONTRACT (MEMBER 01)
 * ============================================================================
 * Member 01 is responsible for User Management and Authentication.
 * Member 05 does NOT create duplicate User models, password hashing, or auth tables.
 *
 * This middleware defines the integration contract:
 * 1. `protect`: Validates the JWT (from Bearer Authorization header or cookies)
 *    and populates `req.user` with `{ _id, name, email, role }`.
 * 2. `authorize`: Enforces role-based authorization for 'administrator', 'instructor', 'learner'.
 *
 * When Member 01's authentication module is merged, this file can either delegate
 * directly to Member 01's exported middleware or be swapped with Member 01's file path.
 * ============================================================================
 */

const protect = async (req, res, next) => {
  let token;

  // Check Bearer authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // Support cookie-based token if Member 01 implements httpOnly cookies
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'skillnest_jwt_shared_secret_2026'
      );

      // Populate standardized req.user
      req.user = {
        _id: decoded.id || decoded._id,
        name: decoded.name || 'User',
        email: decoded.email || '',
        role: decoded.role || 'learner'
      };

      return next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: token is invalid or has expired'
      });
    }
  }

  // Development/Testing fallback header contract (if configured for standalone module testing)
  if (process.env.NODE_ENV !== 'production' && req.headers['x-user-id']) {
    req.user = {
      _id: req.headers['x-user-id'],
      name: req.headers['x-user-name'] || 'Test User',
      email: req.headers['x-user-email'] || 'test@skillnest.local',
      role: req.headers['x-user-role'] || 'learner'
    };
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Not authorized: no authentication token provided'
  });
};

/**
 * Role-based authorization guard
 * @param  {...string} roles Allowed roles ('administrator', 'instructor', 'learner')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user?.role || 'unassigned'}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
