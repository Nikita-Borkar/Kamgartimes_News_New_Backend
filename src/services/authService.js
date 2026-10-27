const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const UnauthorizedError = require("../errors/customErrors/UnauthorizedError");
const User = require("../models/User");
const Role = require("../models/Role");
const { generateTokenPair } = require("../utils/tokens");
const { loginUser, registerUser } = require("../dtos/usersDto");
const { refreshTokenDto } = require("../dtos/tokenPayloadDto");
const ForbiddenError = require("../errors/customErrors/forbiddenError");

const registerUserService = async ({ name, email, password }) => {
  registerUser.parse({ name, email, password }); // Zod validation

  const existingUser = await User.findOne({ email });
  if (existingUser)
    throw new BadRequestError("User already exists with this email");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "user",
  });

  return { id: user._id, name: user.name, email: user.email, role: user.role };
};

const loginUserService = async ({ email, password }) => {
  loginUser.parse({ email, password }); // Zod validation

  const user = await User.findOne({ email });
  if (!user) throw new UnauthorizedError("Invalid email or password");
  if (!user.isActive) throw new ForbiddenError("Your account is inactive");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    throw new UnauthorizedError("Invalid email or password");

  const { accessToken, refreshToken } = generateTokenPair(user);
  const role = await Role.findOne({ name: user.role });
  const permissions = role && role.isActive ? role.permissions : [];

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions,
    },
    accessToken,
    refreshToken,
  };
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select(
    "name email role isActive createdAt",
  );
  if (!user || !user.isActive)
    throw new UnauthorizedError("User not found or inactive");

  const role = await Role.findOne({ name: user.role });
  const permissions = role && role.isActive ? role.permissions : [];

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions,
    createdAt: user.createdAt,
  };
};

const refreshAccessToken = async ({ refreshToken }) => {
  refreshTokenDto.parse({ refreshToken }); // Zod validation

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new UnauthorizedError(
        "Refresh token expired. Please log in again.",
      );
    }
    throw new UnauthorizedError("Invalid refresh token");
  }

  if (decoded.type !== "refresh") {
    throw new UnauthorizedError("Invalid token type");
  }

  // Optional: verify user still exists and is active
  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) {
    throw new UnauthorizedError("User not found or inactive");
  }

  // Issue new access token (and optionally rotate refresh token)
  const newAccessToken = jwt.sign(
    { userId: user._id, role: user.role, type: "access" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" },
  );

  return { accessToken: newAccessToken };
};

module.exports = {
  registerUser: registerUserService,
  loginUser: loginUserService,
  getUserProfile,
  refreshAccessToken,
};
