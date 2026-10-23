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
  city: objectIdString.optional().nullable(),
  featuredImage: z.string().optional().default(""),
  keyPoints: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  readTime: z.string().optional().default(""),
  isLead: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  isTrending: z.boolean().optional().default(false),
  isEditorsPick: z.boolean().optional().default(false),
  isBreaking: z.boolean().optional().default(false),
  seo: seoSchema.optional(),
});

const updateArticleSchema = z.object({
  title: z.string().min(1).max(250).optional(),
  slug: z.string().min(1).max(250).optional(),
  summary: z.string().min(1).max(500).optional(),
  content: z.any().optional(),
  category: objectIdString.optional(),
  author: objectIdString.optional(),
  city: objectIdString.optional().nullable(),
  featuredImage: z.string().optional(),
  keyPoints: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  readTime: z.string().optional(),
  isLead: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isEditorsPick: z.boolean().optional(),
  isBreaking: z.boolean().optional(),
  seo: seoSchema.optional(),
});

// Publishing is a separate action (article:publish) so drafts cannot be
// silently published through a plain update.
const articleStatusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

const articleFlagsSchema = z.object({
  isLead: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isEditorsPick: z.boolean().optional(),
  isBreaking: z.boolean().optional(),
});

const commentStatusSchema = z.object({
  status: z.enum(["APPROVED", "HIDDEN"]),
});

const articleQuerySchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  category: objectIdString.optional(),
  city: objectIdString.optional(),
  search: z.string().optional(),
  tag: z.string().optional(),
  isLead: z.string().optional(),
  isFeatured: z.string().optional(),
  isTrending: z.string().optional(),
  isEditorsPick: z.string().optional(),
  isBreaking: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  createArticleSchema,
  updateArticleSchema,
  articleStatusSchema,
  articleFlagsSchema,
  commentStatusSchema,
  articleQuerySchema,
};
