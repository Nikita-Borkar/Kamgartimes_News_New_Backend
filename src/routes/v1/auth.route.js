const express = require("express");
const router = express.Router();

const {
  register,
  login,
  refresh,
  me,
} = require("../../controllers/authController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const { loginUser, registerUser } = require("../../dtos/usersDto");
const { refreshTokenDto } = require("../../dtos/tokenPayloadDto");

router.post("/register", validate(registerUser), register);
router.post("/login", validate(loginUser), login);
router.post("/refresh", validate(refreshTokenDto), refresh);
router.get("/me", authenticate, me);

module.exports = router;
