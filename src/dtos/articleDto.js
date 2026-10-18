const z = require("zod");
const mongoose = require("mongoose");

const objectIdString = z
  .string()
  .refine((val) => mongoose.isValidObjectId(val), "Invalid ID");

const seoSchema = z.object({
  metaTitle: z.string().max(250).optional().default(""),
  metaDescription: z.string().max(300).optional().default(""),
  keywords: z.array(z.string()).optional().default([]),
});

const createArticleSchema = z.object({
  title: z.string().min(1).max(250),
  slug: z.string().min(1).max(250).optional(),
  summary: z.string().min(1).max(500),
  // Rich text editor payload (HTML string or JSON) — kept as-is like the model
  content: z
    .any()
    .refine(
      (val) => val !== undefined && val !== null && val !== "",
      "Content is required",
    ),
  category: objectIdString,
  // Defaults to the authenticated user when omitted
  author: objectIdString.optional(),
  featuredImage: z.string().optional().default(""),
  seo: seoSchema.optional(),
});

const updateArticleSchema = z.object({
  title: z.string().min(1).max(250).optional(),
  slug: z.string().min(1).max(250).optional(),
  summary: z.string().min(1).max(500).optional(),
  content: z.any().optional(),
  category: objectIdString.optional(),
  author: objectIdString.optional(),
  featuredImage: z.string().optional(),
  seo: seoSchema.optional(),
});

// Publishing is a separate action (article:publish) so drafts cannot be
// silently published through a plain update.
const articleStatusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

const commentStatusSchema = z.object({
  status: z.enum(["APPROVED", "HIDDEN"]),
});

const articleQuerySchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  category: objectIdString.optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  createArticleSchema,
  updateArticleSchema,
  articleStatusSchema,
  commentStatusSchema,
  articleQuerySchema,
};
