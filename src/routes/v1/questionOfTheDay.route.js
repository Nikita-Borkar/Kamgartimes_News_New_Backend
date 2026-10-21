const express = require("express");
const router = express.Router();

const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../../controllers/questionOfTheDayController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const { loadPermissions, requirePermission } = require("../../middlewares/permissionMiddleware");
const {
  createQuestionOfTheDaySchema,
  updateQuestionOfTheDaySchema,
  questionOfTheDayQuerySchema,
} = require("../../dtos/questionOfTheDayDto");

/**
 * @swagger
 * /question-of-the-day:
 *   get:
 *     summary: List questions of the day (admin)
 *     tags: [Question of the Day]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Questions list
 */

/**
 * @swagger
 * /question-of-the-day/{id}:
 *   get:
 *     summary: Get a question of the day by ID (admin)
 *     tags: [Question of the Day]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Question details
 */

/**
 * @swagger
 * /question-of-the-day:
 *   post:
 *     summary: Create a question of the day
 *     tags: [Question of the Day]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question]
 *             properties:
 *               question:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               correctAnswer:
 *                 type: string
 *               explanation:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Question created
 */

/**
 * @swagger
 * /question-of-the-day/{id}:
 *   put:
 *     summary: Update a question of the day
 *     tags: [Question of the Day]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Question updated
 */

/**
 * @swagger
 * /question-of-the-day/{id}:
 *   delete:
 *     summary: Deactivate a question of the day (soft delete)
 *     tags: [Question of the Day]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Question deactivated
 */

router.get(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("qotd:read"),
  validate(questionOfTheDayQuerySchema, "query"),
  list,
);

router.get(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("qotd:read"),
  getById,
);

router.post(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("qotd:create"),
  validate(createQuestionOfTheDaySchema),
  create,
);

router.put(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("qotd:update"),
  validate(updateQuestionOfTheDaySchema),
  update,
);

router.delete(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("qotd:delete"),
  remove,
);

module.exports = router;
