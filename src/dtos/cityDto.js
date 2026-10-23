const z = require("zod");

const createCitySchema = z.object({
  name: z.string().min(1).max(150),
  slug: z.string().min(1).max(150).optional(),
  state: z.string().optional().default(""),
  description: z.string().optional().default(""),
  coverImage: z.string().optional().default(""),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
});

const updateCitySchema = z.object({
  name: z.string().min(1).max(150).optional(),
  slug: z.string().min(1).max(150).optional(),
  state: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

const cityQuerySchema = z.object({
  isActive: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  createCitySchema,
  updateCitySchema,
  cityQuerySchema,
};
