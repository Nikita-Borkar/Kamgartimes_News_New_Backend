const express = require("express");
const router = express.Router();

const { listImages, listVideos } = require("../../controllers/publicMediaController");
const validate = require("../../middlewares/validate");
const { mediaQuerySchema } = require("../../dtos/mediaDto");

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

router.get("/images", validate(mediaQuerySchema), listImages);
router.get("/videos", validate(mediaQuerySchema), listVideos);

module.exports = router;
