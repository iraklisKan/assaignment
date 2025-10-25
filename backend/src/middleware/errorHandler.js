/**
 * Custom error class for API errors
 * 
 * @class AppError
 * @extends Error
 * @param {string} message - Error message
 * @param {number} [statusCode=500] - HTTP status code
 * @param {*} [details=null] - Additional error details
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 * Handles all errors and sends appropriate JSON responses
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message, details } = err;

  if (!err.isOperational) {
    console.error('Unexpected error:', err);
    statusCode = 500;
    message = 'Internal server error';
    details = process.env.NODE_ENV === 'development' ? err.message : undefined;
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

/**
 * Async route handler wrapper
 * Wraps async route handlers to catch and forward errors to error handler
 * 
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 handler middleware
 * Handles requests to non-existent routes
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found'
    }
  });
};
