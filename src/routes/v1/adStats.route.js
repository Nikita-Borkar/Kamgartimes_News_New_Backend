const express = require("express");
const router = express.Router();

const { clicks } = require("../../controllers/adStatsController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const { loadPermissions, requirePermission } = require("../../middlewares/permissionMiddleware");
const { adClickStatsQuerySchema } = require("../../dtos/publicAdDto");

/**
 * @swagger
 * /ad-stats/clicks:
 *   get:
 *     summary: Click report by campaign, slot and day
 *     tags: [Ad Stats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campaign
 *         schema: { type: string }
 *         description: Filter by campaign ID
 *       - in: query
 *         name: slot
 *         schema: { type: string }
 *         description: Filter by slot ID
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Click stats with totals, per-campaign, per-slot and daily breakdowns
 */

router.get(
  "/clicks",
  authenticate,
  loadPermissions,
  requirePermission("ad:read"),
  validate(adClickStatsQuerySchema, "query"),
  clicks
);

module.exports = router;
