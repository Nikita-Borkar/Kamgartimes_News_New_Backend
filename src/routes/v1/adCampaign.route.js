const express = require("express");
const router = express.Router();

const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../../controllers/adCampaignController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const uploadImage = require("../../middlewares/uploadImage");
const { loadPermissions, requirePermission } = require("../../middlewares/permissionMiddleware");
const {
  createAdCampaignSchema,
  updateAdCampaignSchema,
  adCampaignQuerySchema,
} = require("../../dtos/adCampaignDto");

/**
 * @swagger
 * /ad-campaigns:
 *   get:
 *     summary: List ad campaigns (admin)
 *     tags: [Ad Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Ad campaigns list
 *   post:
 *     summary: Create an ad campaign (multipart/form-data, field name "image")
 *     tags: [Ad Campaigns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, clickUrl, image]
 *             properties:
 *               image: { type: string, format: binary }
 *               title: { type: string, example: Diwali Offer }
 *               clickUrl: { type: string, example: /news/diwali-offer }
 *               imageAlt: { type: string }
 *               target: { type: string, enum: [_blank, _self] }
 *               priority: { type: string, example: "10" }
 *               isActive: { type: string, example: "true" }
 *               startDate: { type: string, example: "2026-10-18" }
 *               endDate: { type: string, example: "2026-10-25" }
 *     responses:
 *       201:
 *         description: Ad campaign created
 *       400:
 *         description: Missing image, validation failed, or upload error
 */

/**
 * @swagger
 * /ad-campaigns/{id}:
 *   get:
 *     summary: Get an ad campaign by ID
 *     tags: [Ad Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Ad campaign details
 *       404:
 *         description: Ad campaign not found
 *   put:
 *     summary: Update an ad campaign (optionally replace the image)
 *     tags: [Ad Campaigns]
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
 *         description: Ad campaign updated
 *       404:
 *         description: Ad campaign not found
 *   delete:
 *     summary: Deactivate an ad campaign
 *     tags: [Ad Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Ad campaign deactivated
 *       404:
 *         description: Ad campaign not found
 */

router.get(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("ad:read"),
  validate(adCampaignQuerySchema, "query"),
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
  uploadImage,
  validate(createAdCampaignSchema),
  create
);
router.put(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("ad:update"),
  uploadImage,
  validate(updateAdCampaignSchema),
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
