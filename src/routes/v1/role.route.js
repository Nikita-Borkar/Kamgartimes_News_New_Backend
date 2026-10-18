const express = require("express");
const router = express.Router();

const {
  list,
  getById,
  create,
  update,
  remove,
  getPermissions,
} = require("../../controllers/roleController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const {
  loadPermissions,
  requirePermission,
  requireAnyPermission,
} = require("../../middlewares/permissionMiddleware");
const { createRoleSchema, updateRoleSchema } = require("../../dtos/roleDto");

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: List all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles list
 */

/**
 * @swagger
 * /roles/permissions:
 *   get:
 *     summary: Get permissions list for role creation/assignment dropdown
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions dropdown list
 */

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, displayName]
 *             properties:
 *               name:
 *                 type: string
 *                 example: editor
 *               displayName:
 *                 type: string
 *                 example: Editor
 *               description:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["category:read", "category:create"]
 *     responses:
 *       201:
 *         description: Role created
 */

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Get a role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Role details
 */

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Roles]
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
 *         description: Role updated
 */

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Role deleted
 */

router.get("/", authenticate, loadPermissions, requirePermission("role:read"), list);
router.get(
  "/permissions",
  authenticate,
  loadPermissions,
  requireAnyPermission("role:read", "role:create"),
  getPermissions
);
router.get(
  "/permissions-dropdown",
  authenticate,
  loadPermissions,
  requireAnyPermission("role:read", "role:create"),
  getPermissions
);
router.get("/:id", authenticate, loadPermissions, requirePermission("role:read"), getById);
router.post("/", authenticate, loadPermissions, requirePermission("role:create"), validate(createRoleSchema), create);
router.put("/:id", authenticate, loadPermissions, requirePermission("role:update"), validate(updateRoleSchema), update);
router.delete("/:id", authenticate, loadPermissions, requirePermission("role:delete"), remove);

module.exports = router;