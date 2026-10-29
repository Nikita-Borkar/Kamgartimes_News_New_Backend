const express = require("express");
const router = express.Router();

const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../../controllers/pollController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const {
  createPollSchema,
  updatePollSchema,
  pollQuerySchema,
} = require("../../dtos/pollDto");

/**
 * @swagger
 * /polls:
 *   get:
 *     summary: List polls
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Polls list
 *   post:
 *     summary: Create a poll
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question, options]
 *             properties:
 *               question: { type: string }
 *               options:
 *                 type: array
 *                 minItems: 2
 *                 maxItems: 3
 *                 items:
 *                   type: object
 *                   required: [text]
 *                   properties:
 *                     text: { type: string }
 *               isActive: { type: boolean }
 *               startDate: { type: string, format: date-time }
 *               endDate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Poll created
 */

/**
 * @swagger
 * /polls/{id}:
 *   get:
 *     summary: Get a poll by ID (includes live results)
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Poll details
 *   put:
 *     summary: Update a poll
 *     tags: [Polls]
 *     description: Options cannot be added, removed or renamed once votes exist.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Poll updated
 *       400:
 *         description: Options changed after votes were cast
 *   delete:
 *     summary: Close (deactivate) a poll
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Poll closed
 */

router.get(
  "/",
  authenticate,
  validate(pollQuerySchema, "query"),
  list,
);
router.get(
  "/:id",
  authenticate,
  getById,
);
router.post(
  "/",
  authenticate,
  validate(createPollSchema),
  create,
);
router.put(
  "/:id",
  authenticate,
  validate(updatePollSchema),
  update,
);
router.delete(
  "/:id",
  authenticate,
  remove,
);

module.exports = router;
