const {
  registerUser,
  loginUser,
  refreshAccessToken,
} = require("../services/authService");
const successResponse = require("../errors/responses/successResponse");

const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.validatedBody);
    return res
      .status(201)
      .json(new successResponse(201, "User registered successfully", result));
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.validatedBody);
    return res
      .status(200)
      .json(new successResponse(200, "Login successful", result));
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const result = await refreshAccessToken(req.validatedBody);
    return res
      .status(200)
      .json(new successResponse(200, "Access token refreshed", result));
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware (contains decoded JWT payload)
    return res
      .status(200)
      .json(new successResponse(200, "User profile", req.user));
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, me };
