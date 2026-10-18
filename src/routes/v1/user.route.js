const express = require("express");
const router = express.Router();

const { list, getById, assignRole, deactivate } = require("../../controllers/userController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const { loadPermissions, requirePermission } = require("../../middlewares/permissionMiddleware");
const { assignRoleSchema } = require("../../dtos/userDto");

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users list
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: User details
 */

/**
 * @swagger
 * /users/{id}/role:
 *   put:
 *     summary: Assign a role to a user
 *     tags: [Users]
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
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 example: editor
 *     responses:
 *       200:
 *         description: Role assigned
 */

router.get("/", authenticate, loadPermissions, requirePermission("user:read"), list);
router.get("/:id", authenticate, loadPermissions, requirePermission("user:read"), getById);
router.put("/:id/role", authenticate, loadPermissions, requirePermission("user:assign_role"), validate(assignRoleSchema), assignRole);
router.delete("/:id", authenticate, loadPermissions, requirePermission("user:delete"), deactivate);

module.exports = router;