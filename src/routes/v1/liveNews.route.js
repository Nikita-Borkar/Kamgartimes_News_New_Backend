const express = require("express");
const router = express.Router();

const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../../controllers/liveNewsController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const { loadPermissions, requirePermission } = require("../../middlewares/permissionMiddleware");
const {
  createLiveNewsSchema,
  updateLiveNewsSchema,
  liveNewsQuerySchema,
} = require("../../dtos/liveNewsDto");

/**
 * @swagger
 * /live-news:
 *   get:
 *     summary: List live news items (admin)
 *     tags: [Live News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema: { type: string }
 *       - in: query
 *         name: category
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
 *         description: Live news list
 */

/**
 * @swagger
 * /live-news/{id}:
 *   get:
 *     summary: Get a live news item by ID (admin)
 *     tags: [Live News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Live news item details
 *       404:
 *         description: Live news item not found
 */

/**
 * @swagger
 * /live-news:
 *   post:
 *     summary: Create a live news item
 *     tags: [Live News]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [heading, linkUrl, category]
 *             properties:
 *               heading:
 *                 type: string
 *                 example: Metro service delayed on Blue Line
 *               linkText:
 *                 type: string
 *                 example: Read More
 *               linkUrl:
 *                 type: string
 *                 example: /news/metro-delay
 *               category:
 *                 type: string
 *                 example: 64f8a1b2c3d4e5f6a7b8c9d0
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               priority:
 *                 type: number
 *                 example: 10
 *               publishedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-10-23T06:00:00.000Z"
 *     responses:
 *       201:
 *         description: Live news item created
 *       400:
 *         description: Validation failed
 */

/**
 * @swagger
 * /live-news/{id}:
 *   put:
 *     summary: Update a live news item
 *     tags: [Live News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               heading: { type: string }
 *               linkText: { type: string }
 *               linkUrl: { type: string }
 *               category: { type: string }
 *               isActive: { type: boolean }
 *               priority: { type: number }
 *               publishedAt: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Live news item updated
 *       404:
 *         description: Live news item not found
 */

/**
 * @swagger
 * /live-news/{id}:
 *   delete:
 *     summary: Delete a live news item
 *     tags: [Live News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Live news item deleted
 *       404:
 *         description: Live news item not found
 */

router.get(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("liveNews:read"),
  validate(liveNewsQuerySchema, "query"),
  list
);
router.get(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("liveNews:read"),
  getById
);
router.post(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("liveNews:create"),
  validate(createLiveNewsSchema),
  create
);
router.put(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("liveNews:update"),
  validate(updateLiveNewsSchema),
  update
);
router.delete(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("liveNews:delete"),
  remove
);

module.exports = router;