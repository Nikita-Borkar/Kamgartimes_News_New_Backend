const z = require("zod");
const mongoose = require("mongoose");

const createCategorySchema = z.object({
  name: z.string().nonempty().max(100),
  slug: z.string().nonempty().max(100).optional(),
  description: z.string().optional(),
  parent: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return mongoose.isValidObjectId(val);
    }, "Invalid parent category ID"),
  isActive: z.boolean().optional().default(true),
  order: z.number().optional().default(0),
});

const updateCategorySchema = z.object({
  name: z.string().nonempty().max(100).optional(),
  slug: z.string().nonempty().max(100).optional(),
  description: z.string().optional(),
  parent: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return mongoose.isValidObjectId(val);
    }, "Invalid parent category ID"),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
});

const categoryQuerySchema = z.object({
  parent: z.string().optional(),
  isActive: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
};