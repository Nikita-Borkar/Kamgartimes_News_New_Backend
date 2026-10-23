const express = require("express");
const router = express.Router();

const {
  publicList,
  getPublicBySlug,
} = require("../../controllers/galleryController");
const validate = require("../../middlewares/validate");
const { publicGalleryQuerySchema } = require("../../dtos/galleryDto");

/**
 * @swagger
 * /public/galleries:
 *   get:
 *     summary: List published photo galleries (public)
 *     tags: [Public Galleries]
 *     parameters:
 *       - in: query
 *         name: categorySlug
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Published galleries
 */

/**
 * @swagger
 * /public/galleries/{slug}:
 *   get:
 *     summary: Get a published gallery by slug (public)
 *     tags: [Public Galleries]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Gallery with ordered images
 *       404:
 *         description: Gallery not found
 */

router.get("/", validate(publicGalleryQuerySchema, "query"), publicList);
router.get("/:slug", getPublicBySlug);

module.exports = router;
