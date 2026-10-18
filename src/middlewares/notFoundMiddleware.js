const NotFoundError = require("../errors/customErrors/NotFoundError");

const notFound = (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
};

module.exports = notFound;
