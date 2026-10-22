const express = require("express");
const router = express.Router();

const { list, getById, create, update, remove } = require("../../controllers/imageMediaController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const uploadImage = require("../../middlewares/uploadImage");
const { loadPermissions, requirePermission } = require("../../middlewares/permissionMiddleware");
const { createImageSchema, updateImageSchema, mediaQuerySchema } = require("../../dtos/mediaDto");

/**
 * @swagger
 * /media/images:
 *   get:
 *     summary: List images (admin)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, PUBLISHED] }
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
 *         description: Images list
 *   post:
 *     summary: Upload an image (multipart/form-data, field name "image")
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image, title]
 *             properties:
 *               image: { type: string, format: binary }
 *               title: { type: string }
 *               description: { type: string }
 *               altText: { type: string }
 *               status: { type: string, enum: [DRAFT, PUBLISHED] }
 *     responses:
 *       201:
 *         description: Image uploaded
 *       400:
 *         description: Missing file, wrong type, or over 10 MB
 */

/**
 * @swagger
 * /media/images/{id}:
 *   get:
 *     summary: Get an image by ID
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Image details
 *   put:
 *     summary: Update image metadata
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Image updated
 *   delete:
 *     summary: Delete an image (removes from Cloudinary too)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Image deleted
 */

router.get(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("media:read"),
  validate(mediaQuerySchema, "query"),
  list
);
router.get(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("media:read"),
  getById
);
router.post(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("media:create"),
  uploadImage,
  validate(createImageSchema),
  create
);
router.put(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("media:update"),
  validate(updateImageSchema),
  update
);
router.delete(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("media:delete"),
  remove
);

module.exports = router;
