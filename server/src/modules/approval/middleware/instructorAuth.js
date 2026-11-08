import { optionalAuth } from '../../playground/middleware/playgroundAuth.js';

/**
 * Instructor Authorization Middleware
 * Allows only users whose JWT role claim is exactly "instructor".
 * Returns 401 when no valid token is supplied and 403 when the role is not instructor.
 */
export const instructorAuth = (req, res, next) => {
  optionalAuth(req, res, () => {
    // No token / invalid token
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in to access this resource.'
      });
    }
    // Role check – admins are NOT permitted unless explicitly allowed later.
    if (req.user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        error: 'Instructor access required.'
      });
    }
    // Authorized instructor
    next();
  });
};

