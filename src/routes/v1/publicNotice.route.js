const express = require("express");
const router = express.Router();

const { ticker } = require("../../controllers/noticeController");

/**
 * @swagger
 * /public/notices/ticker:
 *   get:
 *     summary: Active notice ticker feed for the reader site (public)
 *     tags: [Public Notices]
 *     responses:
 *       200:
 *         description: Active notices within their scheduling window, highest priority first
 */

router.get("/ticker", ticker);

module.exports = router;
