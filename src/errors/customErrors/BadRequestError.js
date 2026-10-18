const BaseError = require("./baseError");

class BadRequestError extends BaseError {
  constructor(message = "Bad Request", error = null) {
    super(message, 400, error);
  }
}

module.exports = BadRequestError;
