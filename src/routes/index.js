const express = require("express");
const router = express.Router();

const authRoutes = require("./v1/auth.route");
const healthRoutes = require("./v1/health.route");
const roleRoutes = require("./v1/role.route");
const userRoutes = require("./v1/user.route");
const categoryRoutes = require("./v1/category.route");

router.use("/auth", authRoutes);
router.use("/health", healthRoutes);
router.use("/roles", roleRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);

module.exports = router;
