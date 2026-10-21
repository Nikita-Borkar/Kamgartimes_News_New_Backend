const express = require("express");
const router = express.Router();

const { list, getById, create, update, remove } = require("../../controllers/adSlotController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const { loadPermissions, requirePermission } = require("../../middlewares/permissionMiddleware");
const { createAdSlotSchema, updateAdSlotSchema, adSlotQuerySchema } = require("../../dtos/adSlotDto");

/**
 * @swagger
 * /ad-slots:
 *   get:
 *     summary: List ad slots (admin)
 *     tags: [Ad Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema: { type: string }
 *       - in: query
 *         name: section
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
 *         description: Ad slots list
 *   post:
 *     summary: Create an ad slot
 *     tags: [Ad Slots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, section, size]
 *             properties:
 *               name: { type: string, example: Hero Leaderboard }
 *               key: { type: string, example: hero_leaderboard }
 *               section: { type: string, example: hero }
 *               size:
 *                 type: object
 *                 properties:
 *                   width: { type: number, example: 970 }
 *                   height: { type: number, example: 250 }
 *                   label: { type: string, example: 970x250 }
 *               position: { type: number, example: 0 }
 *               isActive: { type: boolean, example: true }
 *               maxAds: { type: number, example: 1 }
 *     responses:
 *       201:
 *         description: Ad slot created
 *       400:
 *         description: Validation failed or duplicate key
 */

/**
 * @swagger
 * /ad-slots/{id}:
 *   get:
 *     summary: Get an ad slot by ID
 *     tags: [Ad Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Ad slot details
 *       404:
 *         description: Ad slot not found
 *   put:
 *     summary: Update an ad slot
 *     tags: [Ad Slots]
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
 *         description: Ad slot updated
 *       404:
 *         description: Ad slot not found
 *   delete:
 *     summary: Deactivate an ad slot
 *     tags: [Ad Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Ad slot deactivated
 *       404:
 *         description: Ad slot not found
 */

router.get(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("ad:read"),
  validate(adSlotQuerySchema, "query"),
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
  validate(createAdSlotSchema),
  create
);
router.put(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("ad:update"),
  validate(updateAdSlotSchema),
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
