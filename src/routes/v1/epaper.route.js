const express = require("express");
const router = express.Router();

const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../../controllers/epaperController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const {
  createEpaperSchema,
  updateEpaperSchema,
  epaperQuerySchema,
} = require("../../dtos/epaperDto");

/**
 * @swagger
 * /epaper:
 *   get:
 *     summary: List e-paper editions
 *     tags: [E-paper]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema: { type: string }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Editions list
 *   post:
 *     summary: Create an e-paper edition
 *     tags: [E-paper]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, editionDate, pdfUrl]
 *             properties:
 *               title: { type: string }
 *               slug: { type: string }
 *               editionDate: { type: string, format: date }
 *               city: { type: string }
 *               pdfUrl: { type: string }
 *               cloudinaryPublicId: { type: string }
 *               coverImageUrl: { type: string }
 *               pageCount: { type: number }
 *               fileSize: { type: string }
 *               blurb: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       201:
 *         description: Edition created
 */

/**
 * @swagger
 * /epaper/{id}:
 *   get:
 *     summary: Get an e-paper edition by ID
 *     tags: [E-paper]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Edition details
 *   put:
 *     summary: Update an e-paper edition
 *     tags: [E-paper]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Edition updated
 *   delete:
 *     summary: Deactivate an e-paper edition
 *     tags: [E-paper]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Edition deactivated
 */

router.get(
  "/",
  authenticate,
  validate(epaperQuerySchema, "query"),
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
  validate(createEpaperSchema),
  create,
);
router.put(
  "/:id",
  authenticate,
  validate(updateEpaperSchema),
  update,
);
router.delete(
  "/:id",
  authenticate,
  remove,
);

module.exports = router;
