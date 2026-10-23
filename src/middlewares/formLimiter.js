const rateLimit = require("express-rate-limit");

// Public forms write to the database without authentication — keep a single
// IP from flooding the submission collections.
module.exports = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, statusCode: 429, message: "Too many submissions, try again later" },
});
