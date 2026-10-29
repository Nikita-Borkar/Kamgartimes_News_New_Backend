const express = require("express");
const router = express.Router();

const {
  list,
  getById,
  uploadPdf,
  create,
  update,
  updateFlags,
  updateStatus,
  remove,
  moderateCommentStatus,
  removeComment,
} = require("../../controllers/articleController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const uploadArticlePdf = require("../../middlewares/uploadArticlePdf");
const { loadPermissions, requirePermission, requireAnyPermission } = require("../../middlewares/permissionMiddleware");
const {
  createArticleSchema,
  updateArticleSchema,
  articleStatusSchema,
  articleFlagsSchema,
  commentStatusSchema,
  articleQuerySchema,
} = require("../../dtos/articleDto");

/**
 * @swagger
 * /articles:
 *   get:
 *     summary: List all articles (drafts and published)
 *     tags: [Articles]
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
 *         description: Articles list
 *   post:
 *     summary: Create an article (starts as DRAFT)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, summary, content, category]
 *             properties:
 *               title: { type: string }
 *               slug: { type: string }
 *               summary: { type: string }
 *               content: { type: object }
 *               category: { type: string }
 *               author: { type: string }
 *               featuredImage: { type: string }
 *     responses:
 *       201:
 *         description: Article created
 */

/**
 * @swagger
 * /articles/comments/{commentId}:
 *   patch:
 *     summary: Hide or approve a reader comment
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [APPROVED, HIDDEN] }
 *     responses:
 *       200:
 *         description: Comment status updated
 *   delete:
 *     summary: Delete a reader comment (and its replies)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Comment deleted
 */

/**
 * @swagger
 * /articles/{id}:
 *   get:
 *     summary: Get an article by ID
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Article details
 *   put:
 *     summary: Update an article
 *     tags: [Articles]
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
 *         description: Article updated
 *   delete:
 *     summary: Delete an article and its reader data
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Article deleted
 */

/**
 * @swagger
 * /articles/{id}/status:
 *   patch:
 *     summary: Publish or unpublish an article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [DRAFT, PUBLISHED] }
 *     responses:
 *       200:
 *         description: Article status updated
 */

/**
 * @swagger
 * /articles/{id}/flags:
 *   patch:
 *     summary: Toggle editorial flags on an article (homepage curation)
 *     tags: [Articles]
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
 *               isLead: { type: boolean }
 *               isFeatured: { type: boolean }
 *               isTrending: { type: boolean }
 *               isEditorsPick: { type: boolean }
 *               isBreaking: { type: boolean }
 *     responses:
 *       200:
 *         description: Flags updated
 */

// Comment moderation is registered before /:id routes to avoid any
// ambiguity with parametric segments.
router.patch(
  "/comments/:commentId",
  authenticate,
  loadPermissions,
  requirePermission("comment:moderate"),
  validate(commentStatusSchema),
  moderateCommentStatus
);
router.delete(
  "/comments/:commentId",
  authenticate,
  loadPermissions,
  requirePermission("comment:moderate"),
  removeComment
);

router.get(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("article:read"),
  validate(articleQuerySchema, "query"),
  list
);
router.post(
  "/assets/pdf",
  authenticate,
  loadPermissions,
  requireAnyPermission("article:create", "article:update"),
  uploadArticlePdf,
  uploadPdf
);
router.get(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("article:read"),
  getById
);
router.post(
  "/",
  authenticate,
  loadPermissions,
  requirePermission("article:create"),
  validate(createArticleSchema),
  create
);
router.put(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("article:update"),
  validate(updateArticleSchema),
  update
);
router.patch(
  "/:id/flags",
  authenticate,
  loadPermissions,
  requirePermission("article:update"),
  validate(articleFlagsSchema),
  updateFlags
);
router.patch(
  "/:id/status",
  authenticate,
  loadPermissions,
  requirePermission("article:publish"),
  validate(articleStatusSchema),
  updateStatus
);
router.delete(
  "/:id",
  authenticate,
  loadPermissions,
  requirePermission("article:delete"),
  remove
);

module.exports = router;
