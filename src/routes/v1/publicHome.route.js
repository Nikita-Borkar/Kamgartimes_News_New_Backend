const express = require("express");
const router = express.Router();

const { home } = require("../../controllers/publicHomeController");

/**
 * @swagger
 * /public/home:
 *   get:
 *     summary: Composed homepage feed for the reader site (public)
 *     tags: [Public Home]
 *     description: >
 *       One cacheable payload with lead/featured/trending/picks rails, latest
 *       articles, breaking items, per-category sections, videos, shorts,
 *       galleries, the latest e-paper edition, notices and the active poll.
 *     responses:
 *       200:
 *         description: Homepage feed
 */

router.get("/", home);

module.exports = router;
