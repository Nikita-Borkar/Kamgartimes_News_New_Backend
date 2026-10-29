const express = require("express");
const router = express.Router();

const { publicList, getPublicBySlug } = require("../../controllers/staticPageController");
const validate = require("../../middlewares/validate");
const {
  publicStaticPageParamSchema,
  publicStaticPageQuerySchema,
} = require("../../dtos/publicStaticPageDto");

/**
 * @swagger
 * /public/static-pages:
 *   get:
 *     summary: List active static pages for footer menus (public)
 *     tags: [Public Static Pages]
 *     parameters:
 *       - in: query
 *         name: showInFooter
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Active static pages ordered for display
 */

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
  "/",
  validate(publicStaticPageQuerySchema, "query"),
  publicList,
);
router.get(
  "/:slug",
  validate(publicStaticPageParamSchema, "params"),
  getPublicBySlug,
);

module.exports = router;
