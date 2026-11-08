/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts route access to specific user roles (admin, instructor, learner)
 */
const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking role authorization.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${roles.join(', ')}]. Your role is '${req.user.role}'.`,
      });
    }

    next();
  };
};

module.exports = { requireRoles };

