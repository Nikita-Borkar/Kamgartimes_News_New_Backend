const z = require("zod");
const mongoose = require("mongoose");

const objectIdString = z
  .string()
  .refine((val) => mongoose.isValidObjectId(val), "Invalid ID");

const seoSchema = z.object({
  metaTitle: z.string().max(250).optional().default(""),
  metaDescription: z.string().max(300).optional().default(""),
});

const createStaticPageSchema = z.object({
  title: z.string().nonempty().max(200),
  slug: z.string().nonempty().max(100).optional(),
  content: z
    .any()
    .refine(
      (val) => val !== undefined && val !== null && val !== "",
      "Content is required",
    ),
  excerpt: z.string().max(500).optional().default(""),
  isActive: z.boolean().optional().default(true),
  showInFooter: z.boolean().optional().default(false),
  sortOrder: z.number().optional().default(0),
  seo: seoSchema.optional(),
});

const updateStaticPageSchema = z.object({
  title: z.string().nonempty().max(200).optional(),
  slug: z.string().nonempty().max(100).optional(),
  content: z.any().optional(),
  excerpt: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  showInFooter: z.boolean().optional(),
  sortOrder: z.number().optional(),
  seo: seoSchema.optional(),
});

const staticPageQuerySchema = z.object({
  isActive: z.string().optional(),
  showInFooter: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  createStaticPageSchema,
  updateStaticPageSchema,
  staticPageQuerySchema,
};
