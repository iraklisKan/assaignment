/**
 * Custom error class for API errors
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
 */
export function errorHandler(err, req, res, next) {
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
}

/**
 * Async route handler wrapper
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found'
    }
  });
}
