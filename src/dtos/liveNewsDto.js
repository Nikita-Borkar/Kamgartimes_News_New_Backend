const z = require("zod");
const mongoose = require("mongoose");

const objectIdString = z
  .string()
  .refine((val) => mongoose.isValidObjectId(val), "Invalid ID");

const createLiveNewsSchema = z.object({
  heading: z.string().min(1).max(250),
  linkText: z.string().max(100).optional().default("Read More"),
  linkUrl: z.string().min(1).max(1000),
  category: objectIdString,
  isActive: z.boolean().optional().default(true),
  priority: z.number().int().optional().default(0),
  publishedAt: z.coerce.date().optional(),
});

const updateLiveNewsSchema = z.object({
  heading: z.string().min(1).max(250).optional(),
  linkText: z.string().max(100).optional(),
  linkUrl: z.string().min(1).max(1000).optional(),
  category: objectIdString.optional(),
  isActive: z.boolean().optional(),
  priority: z.number().int().optional(),
  publishedAt: z.coerce.date().optional(),
});

const liveNewsQuerySchema = z.object({
  isActive: z.string().optional(),
  category: objectIdString.optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  createLiveNewsSchema,
  updateLiveNewsSchema,
  liveNewsQuerySchema,
};