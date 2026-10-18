const express = require("express");
const router = express.Router();

const authRoutes = require("./v1/auth.route");
const healthRoutes = require("./v1/health.route");

router.use("/auth", authRoutes);
router.use("/health", healthRoutes);

module.exports = router;
