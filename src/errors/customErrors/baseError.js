class BaseError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);

    this.name = this.constructure.name;
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructure);
  }
}

module.exports = BaseError;
