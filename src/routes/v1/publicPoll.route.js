const express = require("express");
const router = express.Router();

const { active, vote } = require("../../controllers/pollController");
const validate = require("../../middlewares/validate");
const optionalAuthenticate = require("../../middlewares/optionalAuthenticate");
const { pollVoteSchema } = require("../../dtos/pollDto");

/**
 * @swagger
 * /public/polls/active:
 *   get:
 *     summary: Get the currently running poll (public)
 *     tags: [Public Polls]
 *     responses:
 *       200:
 *         description: Active poll with options and percentages, or null
 */

/**
 * @swagger
 * /public/polls/{id}/vote:
 *   post:
 *     summary: Vote in the active poll (public; one vote per reader)
 *     tags: [Public Polls]
 *     description: >
 *       Guests are deduplicated by IP + user agent, signed-in readers by
 *       account. Optional bearer token lets the server prefer the account.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [optionId]
 *             properties:
 *               optionId: { type: string }
 *     responses:
 *       200:
 *         description: Vote recorded; returns updated results
 *       400:
 *         description: Invalid option or reader already voted
 */

router.get("/active", active);
router.post(
  "/:id/vote",
  optionalAuthenticate,
  validate(pollVoteSchema),
  vote,
);

module.exports = router;
