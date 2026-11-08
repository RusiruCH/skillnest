import jwt from 'jsonwebtoken';

/**
 * Optional Authentication Middleware
 * If Authorization header is present, extracts and verifies the user.
 * If not present or invalid, proceeds as guest (req.user = null).
 * This seamlessly integrates with Member 01's shared authentication once available.
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      req.user = null;
      return next();
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      if (isProduction) {
        // Fail securely – do not fall back to dev secret
        return res.status(500).json({
          success: false,
          error: 'Server configuration error: JWT_SECRET is required in production.'
        });
      } else {
        console.warn('[Security Warning] JWT_SECRET is not set in development. Using development test secret.');
      }
    }

    const verificationSecret = secret;

    try {
      const decoded = jwt.verify(token, verificationSecret);
      req.user = {
        id: decoded.id || decoded._id || decoded.userId || decoded.sub,
        name: decoded.name || decoded.username || decoded.fullName || 'User',
        email: decoded.email,
        role: decoded.role
      };
    } catch (err) {
      // In production, strictly reject invalid or tampered tokens
      if (isProduction) {
        req.user = null;
        return next();
      }

      // In development, do NOT decode unverified token for auth purposes.
      // Simply treat as unauthenticated.
      req.user = null;
      return next();
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Strict Authentication Middleware
 * Requires a valid user token. Used for modifying/deleting owned snippets.
 */
export const requireAuth = (req, res, next) => {
  optionalAuth(req, res, () => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in to perform this action.'
      });
    }
    next();
  });
};
