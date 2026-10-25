const express = require("express");
const router = express.Router();

const { ticker } = require("../../controllers/liveNewsController");
const validate = require("../../middlewares/validate");
const { liveNewsQuerySchema } = require("../../dtos/liveNewsDto");

/**
 * @swagger
 * /public/live-news:
 *   get:
 *     summary: Active live news items for the reader site (public)
 *     tags: [Public Live News]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Active live news items ordered by priority and go-live time
 */

router.get(
  "/",
  validate(liveNewsQuerySchema, "query"),
  ticker
);

module.exports = router;