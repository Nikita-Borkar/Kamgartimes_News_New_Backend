const BadRequestError = require("../errors/customErrors/BadRequestError");

// Validates req.body by default; pass "query" to validate req.query instead.
// GET requests carry no body, so an undefined body is treated as {} — this keeps
// query-only schemas usable on list endpoints (they read req.query).
const validate = (schema, source = "body") => (req, res, next) => {
  try {
    const raw = source === "query" ? req.query : req.body ?? {};
    const parsed = schema.parse(raw);
    if (source === "query") {
      req.validatedQuery = parsed;
    } else {
      req.validatedBody = parsed;
    }
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
