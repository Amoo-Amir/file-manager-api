class ApiError extends Error {
  constructor(message, statusCode, errorCode = null, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}

module.exports = ApiError;