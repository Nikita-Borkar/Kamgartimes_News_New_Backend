const express = require("express");
const router = express.Router();

const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../../controllers/staticPageController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const { loadPermissions, requirePermission } = require("../../middlewares/permissionMiddleware");
const {
  createStaticPageSchema,
  updateStaticPageSchema,
  staticPageQuerySchema,
} = require("../../dtos/staticPageDto");

/**
 * @swagger
 * /static-pages:
 *   get:
 *     summary: List static pages (admin)
 *     tags: [Static Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema: { type: string }
 *       - in: query
 *         name: showInFooter
 *         schema: { type: string }
 *       - in: query
 *         name: showInHeader
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Static pages list
 */

/**
 * @swagger
 * /static-pages/{id}:
 *   get:
 *     summary: Get a static page by ID (admin)
 *     tags: [Static Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Static page details
 */

/**
 * @swagger
 * /static-pages:
 *   post:
 *     summary: Create a static page
 *     tags: [Static Pages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               content:
 *                 type: object
 *               excerpt:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               showInFooter:
 *                 type: boolean
 *               showInHeader:
 *                 type: boolean
 *               sortOrder:
 *                 type: number
 *     responses:
 *       201:
 *         description: Static page created
 */

/**
 * @swagger
 * /static-pages/{id}:
 *   put:
 *     summary: Update a static page
 *     tags: [Static Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Static page updated
 */

/**
 * @swagger
 * /static-pages/{id}:
 *   delete:
 *     summary: Deactivate a static page (soft delete)
 *     tags: [Static Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Static page deactivated
 */

router.get(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("staticPage:read"),
  validate(staticPageQuerySchema, "query"),
  list,
);

router.get(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("staticPage:read"),
  getById,
);

router.post(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("staticPage:create"),
  validate(createStaticPageSchema),
  create,
);

router.put(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("staticPage:update"),
  validate(updateStaticPageSchema),
  update,
);

router.delete(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("staticPage:delete"),
  remove,
);

module.exports = router;
