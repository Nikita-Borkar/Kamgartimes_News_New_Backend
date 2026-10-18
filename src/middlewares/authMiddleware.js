const jwt = require("jsonwebtoken");
const UnauthorizedError = require("../errors/customErrors/UnauthorizedError");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("No token provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded; // { userId, role, type: "access", iat, exp }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new UnauthorizedError("Access token expired");
    }
    throw new UnauthorizedError("Invalid access token");
  }
};

module.exports = authenticate;
