const express = require("express");
const router = express.Router();

const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../../controllers/cityController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const { loadPermissions, requirePermission } = require("../../middlewares/permissionMiddleware");
const { createCitySchema, updateCitySchema, cityQuerySchema } = require("../../dtos/cityDto");

/**
 * @swagger
 * /cities:
 *   get:
 *     summary: List cities
 *     tags: [Cities]
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
 *         description: Cities list
 *   post:
 *     summary: Create a city
 *     tags: [Cities]
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
 *               name: { type: string }
 *               slug: { type: string }
 *               state: { type: string }
 *               description: { type: string }
 *               coverImage: { type: string }
 *               isActive: { type: boolean }
 *               order: { type: number }
 *     responses:
 *       201:
 *         description: City created
 */

/**
 * @swagger
 * /cities/{id}:
 *   get:
 *     summary: Get a city by ID
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: City details
 *   put:
 *     summary: Update a city
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: City updated
 *   delete:
 *     summary: Deactivate a city
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: City deactivated
 */

router.get(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("city:read"),
  validate(cityQuerySchema, "query"),
  list,
);
router.get(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("city:read"),
  getById,
);
router.post(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("city:create"),
  validate(createCitySchema),
  create,
);
router.put(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("city:update"),
  validate(updateCitySchema),
  update,
);
router.delete(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("city:delete"),
  remove,
);

module.exports = router;
