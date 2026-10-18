const ApiResponse = require("./ApiResponse");

class successResponse extends ApiResponse {
  constructor(statusCode, message, data = null) {
    super(true, statusCode, message);

    this.data = data;
  }
}

module.exports = successResponse;
