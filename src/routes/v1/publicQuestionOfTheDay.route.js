const express = require("express");
const router = express.Router();

const { today } = require("../../controllers/questionOfTheDayController");
const validate = require("../../middlewares/validate");
const { publicQotdQuerySchema } = require("../../dtos/publicQotdDto");

/**
 * @swagger
 * /public/question-of-the-day:
 *   get:
 *     summary: Get today's active question of the day (public)
 *     tags: [Public Question of the Day]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Today's active question
 *       404:
 *         description: No active question found
 */

router.get("/", validate(publicQotdQuerySchema, "query"), today);

module.exports = router;
