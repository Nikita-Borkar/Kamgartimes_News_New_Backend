const express = require("express");
const router = express.Router();

const { get, update } = require("../../controllers/siteSettingController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const { loadPermissions, requirePermission } = require("../../middlewares/permissionMiddleware");
const uploadImage = require("../../middlewares/uploadImage");
const { updateSiteSettingSchema } = require("../../dtos/siteSettingDto");

/**
 * @swagger
 * /site-setting:
 *   get:
 *     summary: Get site configuration (logo, tagline, social links)
 *     tags: [Site Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Site setting object
 */

/**
 * @swagger
 * /site-setting:
 *   put:
 *     summary: Update site configuration (logo upload optional)
 *     tags: [Site Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               siteName:
 *                 type: string
 *               tagline:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               address:
 *                 type: string
 *               isMaintenanceMode:
 *                 type: boolean
 *               socialLinks:
 *                 type: string
 *                 description: JSON string of social links array
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Logo image file
 *     responses:
 *       200:
 *         description: Site setting updated
 *       400:
 *         description: Validation failed
 */

router.get(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("setting:read"),
  get,
);

router.put(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("setting:update"),
  uploadImage,
  validate(updateSiteSettingSchema),
  update,
);

module.exports = router;
