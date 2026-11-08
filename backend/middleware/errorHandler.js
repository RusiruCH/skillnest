/**
 * Centralized Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (process.env.NODE_ENV !== 'production') {
    console.error('[API Error]:', err);
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    return res.status(404).json({
      success: false,
      message: `Resource not found with ID: ${err.value}`
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `Duplicate entry for '${field}'. This value must be unique.`
    });
  }

  // Mongoose schema validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join('. ')
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid authentication token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Authentication token has expired' });
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
