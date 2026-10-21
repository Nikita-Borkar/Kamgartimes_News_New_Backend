const express = require("express");
const router = express.Router();

const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../../controllers/adPlacementController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const { loadPermissions, requirePermission } = require("../../middlewares/permissionMiddleware");
const {
  createAdPlacementSchema,
  updateAdPlacementSchema,
  adPlacementQuerySchema,
} = require("../../dtos/adPlacementDto");

/**
 * @swagger
 * /ad-placements:
 *   get:
 *     summary: List ad placements (admin)
 *     tags: [Ad Placements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: adSlot
 *         schema: { type: string }
 *       - in: query
 *         name: adCampaign
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Ad placements list
 *   post:
 *     summary: Assign a campaign to a slot
 *     tags: [Ad Placements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [adSlot, adCampaign]
 *             properties:
 *               adSlot: { type: string, example: 64f8a1b2c3d4e5f6a7b8c9d0 }
 *               adCampaign: { type: string, example: 64f8a1b2c3d4e5f6a7b8c9d1 }
 *               startDate: { type: string, format: date-time }
 *               endDate: { type: string, format: date-time }
 *               isActive: { type: boolean, example: true }
 *               weight: { type: number, example: 50 }
 *     responses:
 *       201:
 *         description: Ad placement created
 *       400:
 *         description: Validation failed, bad slot/campaign, or invalid window
 */

/**
 * @swagger
 * /ad-placements/{id}:
 *   get:
 *     summary: Get an ad placement by ID
 *     tags: [Ad Placements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Ad placement details
 *       404:
 *         description: Ad placement not found
 *   put:
 *     summary: Update an ad placement
 *     tags: [Ad Placements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Ad placement updated
 *       404:
 *         description: Ad placement not found
 *   delete:
 *     summary: Remove an ad placement
 *     tags: [Ad Placements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Ad placement deleted
 *       404:
 *         description: Ad placement not found
 */

router.get(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("ad:read"),
  validate(adPlacementQuerySchema, "query"),
  list
);
router.get(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("ad:read"),
  getById
);
router.post(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("ad:create"),
  validate(createAdPlacementSchema),
  create
);
router.put(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("ad:update"),
  validate(updateAdPlacementSchema),
  update
);
router.delete(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("ad:delete"),
  remove
);

module.exports = router;
