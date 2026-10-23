const express = require("express");
const router = express.Router();

const {
  publicList,
  getPublicBySlug,
} = require("../../controllers/epaperController");
const validate = require("../../middlewares/validate");
const { publicEpaperQuerySchema } = require("../../dtos/epaperDto");

/**
 * @swagger
 * /public/epaper:
 *   get:
 *     summary: List active e-paper editions, newest first (public)
 *     tags: [Public E-paper]
 *     parameters:
 *       - in: query
 *         name: citySlug
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Editions plus the latest one
 */

/**
 * @swagger
 * /public/epaper/{slug}:
 *   get:
 *     summary: Get an active e-paper edition by slug (public)
 *     tags: [Public E-paper]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Edition details with PDF URL
 *       404:
 *         description: Edition not found
 */

router.get("/", validate(publicEpaperQuerySchema, "query"), publicList);
router.get("/:slug", getPublicBySlug);

module.exports = router;
