const express = require("express");
const router = express.Router();

const {
  list,
  tree,
  subCategories,
  getById,
  create,
  update,
  remove,
} = require("../../controllers/categoryController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const { loadPermissions, requirePermission } = require("../../middlewares/permissionMiddleware");
const {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
} = require("../../dtos/categoryDto");

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: List all categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parent
 *         schema: { type: string }
 *         description: Use "null" for main categories, or a category ID for subcategories
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
 *         description: Categories list
 */

/**
 * @swagger
 * /categories/tree:
 *   get:
 *     summary: Get category tree (main categories with subcategories)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category tree
 */

/**
 * @swagger
 * /categories/{id}/subcategories:
 *   get:
 *     summary: Get subcategories of a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Subcategories list
 */

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Category details
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: News
 *               slug:
 *                 type: string
 *                 example: news
 *               description:
 *                 type: string
 *               parent:
 *                 type: string
 *                 example: 64f8a1b2c3d4e5f6a7b8c9d0
 *               isActive:
 *                 type: boolean
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: Category created
 */

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Category updated
 */

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Deactivate a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Category deactivated
 *       400:
 *         description: Cannot deactivate category with subcategories
 */

router.get(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("category:read"),
  validate(categoryQuerySchema),
  list
);
router.get(
  "/tree",
  authenticate,
  loadPermissions,
  requirePermission("category:read"),
  tree
);
router.get(
  "/:id/subcategories",
  authenticate,
  loadPermissions,
  requirePermission("category:read"),
  subCategories
);
router.get(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("category:read"),
  getById
);
router.post(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("category:create"),
  validate(createCategorySchema),
  create
);
router.put(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("category:update"),
  validate(updateCategorySchema),
  update
);
router.delete(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("category:delete"),
  remove
);

module.exports = router;