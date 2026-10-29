const express = require("express");
const router = express.Router();

const { list, getById, create, update, remove } = require("../../controllers/noticeController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const { loadPermissions, requirePermission } = require("../../middlewares/permissionMiddleware");
const {
  createNoticeSchema,
  updateNoticeSchema,
  noticeQuerySchema,
} = require("../../dtos/noticeDto");

/**
 * @swagger
 * /notices:
 *   get:
 *     summary: List notices (admin)
 *     tags: [Notices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Case-insensitive search on notice title
 *       - in: query
 *         name: page
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notices list
 */

/**
 * @swagger
 * /notices/{id}:
 *   get:
 *     summary: Get a notice by ID (admin)
 *     tags: [Notices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Notice details
 *       404:
 *         description: Notice not found
 */

/**
 * @swagger
 * /notices:
 *   post:
 *     summary: Create a notice
 *     tags: [Notices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 example: All offices will remain closed on 20th Oct.
 *               linkUrl:
 *                 type: string
 *                 example: /news/diwali-holiday-order
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               startsAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-10-18T00:00:00.000Z"
 *               endsAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-10-22T23:59:59.000Z"
 *     responses:
 *       201:
 *         description: Notice created
 *       400:
 *         description: Validation failed
 */

/**
 * @swagger
 * /notices/{id}:
 *   put:
 *     summary: Update a notice
 *     tags: [Notices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
*               message: { type: string }
 *               linkUrl: { type: string }
*               isActive: { type: boolean }
 *               startsAt: { type: string, format: date-time }
 *               endsAt: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Notice updated
 *       404:
 *         description: Notice not found
 */

/**
 * @swagger
 * /notices/{id}:
 *   delete:
 *     summary: Delete a notice
 *     tags: [Notices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Notice deleted
 *       404:
 *         description: Notice not found
 */

router.get(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("notice:read"),
  validate(noticeQuerySchema, "query"),
  list
);
router.get(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("notice:read"),
  getById
);
router.post(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("notice:create"),
  validate(createNoticeSchema),
  create
);
router.put(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("notice:update"),
  validate(updateNoticeSchema),
  update
);
router.delete(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("notice:delete"),
  remove
);

module.exports = router;
