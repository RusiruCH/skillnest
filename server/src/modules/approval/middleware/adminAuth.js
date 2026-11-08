// Admin Authorization Middleware
// Ensures that the request is made by an authenticated user with role 'admin'.
// Uses the existing optionalAuth middleware to parse the JWT. If the token
// is missing, malformed, or the role claim is absent or not 'admin', a 403
// response is returned.

import { optionalAuth } from '../../playground/middleware/playgroundAuth.js';

export const adminAuth = (req, res, next) => {
  // First run optionalAuth to populate req.user (if possible)
  optionalAuth(req, res, () => {
    // req.user may be null if no token or verification failed
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required: missing or invalid token.' });
    }
    // Role claim may not exist – treat missing as non‑admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required: insufficient privileges.' });
    }
    // Authorized
    next();
  });
};
