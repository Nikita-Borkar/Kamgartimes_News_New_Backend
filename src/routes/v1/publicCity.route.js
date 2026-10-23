const express = require("express");
const router = express.Router();

const {
  publicList,
  getPublicBySlug,
} = require("../../controllers/cityController");

/**
 * @swagger
 * /public/cities:
 *   get:
 *     summary: Active cities for the hyperlocal menu (public)
 *     tags: [Public Cities]
 *     responses:
 *       200:
 *         description: Active cities ordered for display
 */

/**
 * @swagger
 * /public/cities/{slug}:
 *   get:
 *     summary: Get an active city by slug (public)
 *     tags: [Public Cities]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: City details
 *       404:
 *         description: City not found
 */

router.get("/", publicList);
router.get("/:slug", getPublicBySlug);

module.exports = router;
