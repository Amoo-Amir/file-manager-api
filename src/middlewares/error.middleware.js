const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  // خطاهای عمدی (ApiError) رو warn لاگ کن، بقیه رو error
  const isOperational = !!err.statusCode;

  if (isOperational) {
    logger.warn(`${err.statusCode} — ${err.message}`, {
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error("Unexpected error", {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;