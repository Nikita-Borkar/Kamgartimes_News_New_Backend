const BaseError = require("./baseError");

class NotFoundError extends BaseError {
  constructor(message = "Not Found", error = null) {
    super(message, 404, error);
  }
}

module.exports = NotFoundError;
