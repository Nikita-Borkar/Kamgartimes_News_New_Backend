const express = require("express");
const router = express.Router();

const { getPublicBySlug } = require("../../controllers/staticPageController");
const validate = require("../../middlewares/validate");
const { publicStaticPageParamSchema } = require("../../dtos/publicStaticPageDto");

/**
 * @swagger
 * /public/static-pages/{slug}:
 *   get:
 *     summary: Get a published static page by slug (public)
 *     tags: [Public Static Pages]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Static page content
 *       404:
 *         description: Static page not found
 */

router.get(
  "/:slug",
  validate(publicStaticPageParamSchema),
  getPublicBySlug,
);

module.exports = router;
