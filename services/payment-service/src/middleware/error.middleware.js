exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'StripeError') {
    return res.status(err.statusCode || 500).json({
      message: err.message,
      code: err.code
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
};
