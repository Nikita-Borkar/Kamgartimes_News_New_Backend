const ApiResponse = require("./ApiResponse");

class errorResponse extends ApiResponse {
  constructor(statusCode, message, error = null) {
    super(false, statusCode, message);

    this.error = error;
  }
}

module.exports = errorResponse;
