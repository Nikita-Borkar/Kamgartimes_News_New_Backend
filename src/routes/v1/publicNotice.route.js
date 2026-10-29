const express = require("express");
const router = express.Router();

const { ticker } = require("../../controllers/noticeController");
const validate = require("../../middlewares/validate");
const { publicNoticeQuerySchema } = require("../../dtos/noticeDto");

/**
 * @swagger
 * /public/notices/ticker:
 *   get:
 *     summary: Active notice ticker feed for the reader site (public)
 *     tags: [Public Notices]
 *     parameters:
 *       - in: query
 *         name: kind
 *         schema: { type: string, enum: [NOTICE, BREAKING] }
 *         description: Filter the ticker to plain notices or breaking items
 *     responses:
 *       200:
 *         description: Active notices within their scheduling window, newest first
 */

router.get("/ticker", validate(publicNoticeQuerySchema, "query"), ticker);

module.exports = router;
