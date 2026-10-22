const express = require("express");
const router = express.Router();

const { list, getById, create, update, remove } = require("../../controllers/videoMediaController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const { loadPermissions, requirePermission } = require("../../middlewares/permissionMiddleware");
const { createVideoSchema, updateVideoSchema, mediaQuerySchema } = require("../../dtos/mediaDto");

/**
 * @swagger
 * /media/videos:
 *   get:
 *     summary: List YouTube videos (admin)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, PUBLISHED] }
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
 *         description: Videos list
 *   post:
 *     summary: Add a YouTube video (ID extracted server-side from the URL)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, youtubeUrl, videoType, category]
 *             properties:
 *               title: { type: string }
 *               altText: { type: string }
 *               youtubeUrl: { type: string, example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
 *               videoType: { type: string, enum: [SHORT, VIDEO] }
 *               category: { type: string }
 *               status: { type: string, enum: [DRAFT, PUBLISHED] }
 *     responses:
 *       201:
 *         description: Video created
 *       400:
 *         description: Invalid YouTube URL or category
 */

/**
 * @swagger
 * /media/videos/{id}:
 *   get:
 *     summary: Get a video by ID
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Video details (includes derived embedUrl and thumbnailUrl)
 *   put:
 *     summary: Update video metadata (re-extracts ID if youtubeUrl changes)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Video updated
 *   delete:
 *     summary: Delete a video record (DB only, YouTube keeps the source)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Video deleted
 */

router.get(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("media:read"),
  validate(mediaQuerySchema, "query"),
  list
);
router.get(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("media:read"),
  getById
);
router.post(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("media:create"),
  validate(createVideoSchema),
  create
);
router.put(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("media:update"),
  validate(updateVideoSchema),
  update
);
router.delete(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("media:delete"),
  remove
);

module.exports = router;
