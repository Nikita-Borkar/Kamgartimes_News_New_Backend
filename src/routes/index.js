const express = require("express");
const router = express.Router();

const authRoutes = require("./v1/auth.route");
const healthRoutes = require("./v1/health.route");
const roleRoutes = require("./v1/role.route");
const userRoutes = require("./v1/user.route");

router.use("/auth", authRoutes);
router.use("/health", healthRoutes);
router.use("/roles", roleRoutes);
router.use("/users", userRoutes);

module.exports = router;
