class ApiResponse {
  constructor(success, statusCode, message) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
  }
}

module.exports = ApiResponse;
