const express = require("express");
const router = express.Router();

const {
  list,
  getBySlug,
  getById,
  view,
  share,
  click,
  reactions,
  toggleReaction,
  listComments,
  createComment,
} = require("../../controllers/publicArticleController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const optionalAuthenticate = require("../../middlewares/optionalAuthenticate");
const {
  publicArticleQuerySchema,
  reactionSchema,
  commentSchema,
  commentQuerySchema,
} = require("../../dtos/publicArticleDto");

/**
 * @swagger
 * /public/articles:
 *   get:
 *     summary: List published articles for the reader site (public)
 *     tags: [Public Articles]
 *     parameters:
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
 *         description: Published articles list (without content bodies)
 */

/**
 * @swagger
 * /public/articles/{slug}:
 *   get:
 *     summary: Get a published article by slug (public)
 *     tags: [Public Articles]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Article details
 *       404:
 *         description: Article not found or not published
 */

/**
 * @swagger
 * /public/articles/{id}/view:
 *   post:
 *     summary: Record an article view (public)
 *     tags: [Public Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: View recorded
 */

/**
 * @swagger
 * /public/articles/{id}/share:
 *   post:
 *     summary: Record an article share (public)
 *     tags: [Public Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Share recorded
 */

/**
 * @swagger
 * /public/articles/{id}/clicks:
 *   post:
 *     summary: Record an outbound link click on an article (public)
 *     tags: [Public Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Click recorded
 */

/**
 * @swagger
 * /public/articles/{id}/reactions:
 *   get:
 *     summary: Get like/dislike counts (optional auth for the caller's own reaction)
 *     tags: [Public Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Reaction counts
 *   post:
 *     summary: Toggle like/dislike on an article (authenticated readers)
 *     tags: [Public Articles]
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
 *             required: [type]
 *             properties:
 *               type: { type: string, enum: [LIKE, DISLIKE] }
 *     responses:
 *       200:
 *         description: Reaction toggled
 */

/**
 * @swagger
 * /public/articles/{id}/comments:
 *   get:
 *     summary: List approved comments for an article (public)
 *     tags: [Public Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Comments list with replies
 *   post:
 *     summary: Add a comment to an article (authenticated readers)
 *     tags: [Public Articles]
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
 *             required: [body]
 *             properties:
 *               body: { type: string }
 *               parent: { type: string }
 *     responses:
 *       201:
 *         description: Comment created
 */

// Counters first (they are parametric, single-segment siblings of /:slug)
router.post("/:id/view", view);
router.post("/:id/share", share);
router.post("/:id/clicks", click);

// Reactions — read is public/optional-auth, toggle requires login
router.get("/:id/reactions", optionalAuthenticate, reactions);
router.post("/:id/reactions", authenticate, validate(reactionSchema), toggleReaction);

// Comments — read is public, write requires login
router.get("/:id/comments", validate(commentQuerySchema), listComments);
router.post("/:id/comments", authenticate, validate(commentSchema), createComment);

// Reader listings
router.get("/", validate(publicArticleQuerySchema), list);
router.get("/:slug", getBySlug);

module.exports = router;
