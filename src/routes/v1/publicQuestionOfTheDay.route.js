const express = require("express");
const router = express.Router();

const { today, checkAnswer } = require("../../controllers/questionOfTheDayController");
const validate = require("../../middlewares/validate");
const { publicQotdQuerySchema, publicQotdAnswerSchema } = require("../../dtos/publicQotdDto");

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

/**
 * @swagger
 * /public/question-of-the-day/check:
 *   post:
 *     summary: Check a reader's answer against today's question (public)
 *     tags: [Public Question of the Day]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answer]
 *             properties:
 *               answer: { type: string }
 *               category: { type: string }
 *     responses:
 *       200:
 *         description: Result of the answer check
 *       404:
 *         description: No active question found
 */

router.post("/check", validate(publicQotdAnswerSchema), checkAnswer);

module.exports = router;
