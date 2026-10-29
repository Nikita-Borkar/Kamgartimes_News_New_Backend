const express = require("express");
const router = express.Router();

const {
  list,
  getById,
  create,
  update,
  remove,
} = require("../../controllers/galleryController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const {
  createGallerySchema,
  updateGallerySchema,
  galleryQuerySchema,
} = require("../../dtos/galleryDto");

/**
 * @swagger
 * /galleries:
 *   get:
 *     summary: List galleries
 *     tags: [Galleries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, PUBLISHED] }
 *       - in: query
 *         name: category
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
 *         description: Galleries list
 *   post:
 *     summary: Create a gallery
 *     tags: [Galleries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               slug: { type: string }
 *               description: { type: string }
 *               coverImage: { type: string }
 *               category: { type: string }
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [imageUrl]
 *                   properties:
 *                     imageUrl: { type: string }
 *                     cloudinaryPublicId: { type: string }
 *                     caption: { type: string }
 *                     altText: { type: string }
 *               status: { type: string, enum: [DRAFT, PUBLISHED] }
 *     responses:
 *       201:
 *         description: Gallery created
 */

/**
 * @swagger
 * /galleries/{id}:
 *   get:
 *     summary: Get a gallery by ID
 *     tags: [Galleries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Gallery details
 *   put:
 *     summary: Update a gallery
 *     tags: [Galleries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Gallery updated
 *   delete:
 *     summary: Delete a gallery
 *     tags: [Galleries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Gallery deleted
 */

router.get(
  "/",
  authenticate,
  validate(galleryQuerySchema, "query"),
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
  validate(createGallerySchema),
  create,
);
router.put(
  "/:id",
  authenticate,
  validate(updateGallerySchema),
  update,
);
router.delete(
  "/:id",
  authenticate,
  remove,
);

module.exports = router;
