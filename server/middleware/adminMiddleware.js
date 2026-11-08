const { protect } = require('./authMiddleware');
const { requireRoles } = require('./roleMiddleware');

/**
 * Admin Access Middleware - Module 2 (Member 02)
 * Ensures user is authenticated and possesses the administrator role.
 */
const requireAdmin = [protect, requireRoles('admin')];

module.exports = {
  requireAdmin,
};

