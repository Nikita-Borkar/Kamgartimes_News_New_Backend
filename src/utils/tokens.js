const jwt = require("jsonwebtoken");
const { tokenPayload } = require("../dtos/tokenPayloadDto");

const generateAccessToken = (user) => {
  const payload = {
    userId: user._id.toString(),
    role: user.role,
    type: "access",
  };
  tokenPayload.parse(payload); // Zod validation
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (user) => {
  const payload = {
    userId: user._id.toString(),
    role: user.role,
    type: "refresh",
  };
  tokenPayload.parse(payload);
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7m" });
};

const generateTokenPair = (user) => ({
  accessToken: generateAccessToken(user),
  refreshToken: generateRefreshToken(user),
});

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
};
