const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for ${field}. This ${field} already exists.`;
    statusCode = 409;
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join('. ');
    statusCode = 400;
  }

  if (err.name === 'CastError') {
    message = 'Resource not found.';
    statusCode = 404;
  }

  if (process.env.NODE_ENV === 'production') {
    res.status(statusCode).json({
      success: false,
      message,
    });
  } else {
    res.status(statusCode).json({
      success: false,
      message,
      stack: err.stack,
    });
  }
};

module.exports = errorHandler;
