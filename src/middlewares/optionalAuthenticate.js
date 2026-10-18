const jwt = require("jsonwebtoken");

// Attaches req.user when a valid access token is present, but never rejects
// the request — used on public endpoints where guests are also welcome.
const optionalAuthenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    }
  } catch (err) {
    // Invalid/expired token → treat the caller as a guest
  }
  next();
};

module.exports = optionalAuthenticate;
