const BadRequestError = require("../errors/customErrors/BadRequestError");

const validate = (schema) => (req, res, next) => {
  try {
    req.validatedBody = schema.parse(req.body);
    next();
  } catch (err) {
    if (err.name === "ZodError") {
      const issues = (err.issues || []).map((e) => ({
        field: e.path ? e.path.join(".") : "",
        message: e.message,
      }));
      throw new BadRequestError("Validation failed", issues);
    }
    next(err);
  }
};

module.exports = validate;
