const z = require("zod");
const mongoose = require("mongoose");

const objectIdString = z
  .string()
  .refine((val) => mongoose.isValidObjectId(val), "Invalid ID");

const publicArticleQuerySchema = z.object({
  category: objectIdString.optional(),
  categorySlug: z.string().trim().optional(),
  city: objectIdString.optional(),
  citySlug: z.string().trim().optional(),
  search: z.string().optional(),
  tag: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

const reactionSchema = z.object({
  type: z.enum(["LIKE", "DISLIKE"]),
});

const commentSchema = z.object({
  body: z.string().min(1).max(2000),
  // Optional top-level parent; replies to replies are rejected in the service
  parent: objectIdString.optional(),
});

const commentQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

const relatedQuerySchema = z.object({
  limit: z.string().optional(),
});

module.exports = {
  publicArticleQuerySchema,
  reactionSchema,
  commentSchema,
  commentQuerySchema,
  relatedQuerySchema,
};
