const express = require("express");
const router = express.Router();

const {
  listImages,
  listVideos,
  getImageById,
  getVideoById,
} = require("../../controllers/publicMediaController");
const validate = require("../../middlewares/validate");
const { mediaQuerySchema, mediaIdParamSchema } = require("../../dtos/mediaDto");

/**
 * @swagger
 * /public/media/images:
 *   get:
 *     summary: List published images for the reader site (public)
 *     tags: [Public Media]
 *     parameters:
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
 *         description: Published images list
 */

/**
 * @swagger
 * /public/media/videos:
 *   get:
 *     summary: List published YouTube videos for the reader site (public)
 *     tags: [Public Media]
 *     parameters:
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
 *         description: Published videos list
 */

/**
 * @swagger
 * /public/media/images/{id}:
 *   get:
 *     summary: Get a published image by ID (public)
 *     tags: [Public Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Image details
 *       404:
 *         description: Image not found or not published
 */

/**
 * @swagger
 * /public/media/videos/{id}:
 *   get:
 *     summary: Get a published video by ID (public)
 *     tags: [Public Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Video details
 *       404:
 *         description: Video not found or not published
 */

router.get("/images", validate(mediaQuerySchema), listImages);
router.get("/videos", validate(mediaQuerySchema), listVideos);
router.get("/images/:id", validate(mediaIdParamSchema, "params"), getImageById);
router.get("/videos/:id", validate(mediaIdParamSchema, "params"), getVideoById);

module.exports = router;
