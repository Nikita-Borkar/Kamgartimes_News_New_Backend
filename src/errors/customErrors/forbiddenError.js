const BaseError = require("./baseError");

class ForbiddenError extends BaseError {
  constructor(message = "Forbidden", error = null) {
    super(message, 403, error);
  }
}

module.exports = ForbiddenError;