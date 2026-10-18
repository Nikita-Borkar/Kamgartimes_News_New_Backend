const BaseError = require("./baseError");

class UnauthrizedError extends BaseError {
  constructor(message = "Unauthrized", error = null) {
    super(message, 401, error);
  }
}

module.exports = UnauthrizedError;
