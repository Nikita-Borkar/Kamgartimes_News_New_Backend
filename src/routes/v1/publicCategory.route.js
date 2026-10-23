const express = require("express");
const router = express.Router();

const { list, getBySlug } = require("../../controllers/publicCategoryController");

/**
 * @swagger
 * /public/categories:
 *   get:
 *     summary: Active category tree for navigation (public)
 *     tags: [Public Categories]
 *     responses:
 *       200:
 *         description: Main categories with active subcategories
 */

/**
 * @swagger
 * /public/categories/{slug}:
 *   get:
 *     summary: Get an active category by slug (public)
 *     tags: [Public Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category with subcategories
 *       404:
 *         description: Category not found
 */

router.get("/", list);
router.get("/:slug", getBySlug);

module.exports = router;
