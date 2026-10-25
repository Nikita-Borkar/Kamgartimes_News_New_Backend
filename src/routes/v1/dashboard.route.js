const express = require("express");
const router = express.Router();

const { overview } = require("../../controllers/dashboardController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const { loadPermissions, requirePermission } = require("../../middlewares/permissionMiddleware");
const { dashboardQuerySchema } = require("../../dtos/dashboardDto");

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Admin dashboard overview
 *     description: Aggregate counts, daily series and small previews across all admin modules.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         schema: { type: string, enum: [7d, 30d, 90d], default: 30d }
 *         description: Reporting window for in-range counts and daily series
 *     responses:
 *       200:
 *         description: Dashboard summary, series, editorial queue and previews
 *       403:
 *         description: Missing dashboard:read permission
 */

router.get(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("dashboard:read"),
  validate(dashboardQuerySchema, "query"),
  overview,
);

module.exports = router;
