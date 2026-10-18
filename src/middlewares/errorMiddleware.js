const errorResponse = require("../errors/responses/errorResponse");

const sendErrorDev = (err, res) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json(
    new errorResponse(statusCode, message, {
      error: err,
      stack: err.stack,
      ...(err.errors ? { errors: err.errors } : {}),
    }),
  );
};

const sendErrorProd = (err, res) => {
  // Operational, trusted errors: send the intended message to the client
  if (err.isOperational) {
    return res
      .status(err.statusCode || 500)
      .json(
        new errorResponse(
          err.statusCode || 500,
          err.message || "Internal Server Error",
        ),
      );
  }

  // Programming or unknown errors: do not leak details to live users
  console.error("ERROR 💥", err);
  return res.status(500).json(new errorResponse(500, "Something went wrong!"));
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

module.exports = globalErrorHandler;
