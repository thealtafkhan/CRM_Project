/**
 * Centralized Error Handling Middleware conforming to RFC 7807 Problem Details
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let title = 'Internal Server Error';
  let detail = err.message || 'An unexpected error occurred.';

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    title = 'Validation Error';
    const errors = Object.values(err.errors).map(el => el.message);
    detail = errors.join('; ');
  }

  // Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    title = 'Duplicate Resource Conflict';
    const field = Object.keys(err.keyValue)[0];
    detail = `A record with this ${field} already exists: ${err.keyValue[field]}.`;
  }

  // Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 404;
    title = 'Resource Not Found';
    detail = `Invalid ID format for resource: ${err.value}.`;
  }

  console.error(`[ERROR] ${statusCode} - ${title}: ${detail}`);

  res.status(statusCode).json({
    status: statusCode,
    title,
    detail,
    instance: req.originalUrl,
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
