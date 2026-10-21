const z = require("zod");
const { booleanish, intish, intRequired } = require("./adShared");

const sizeSchema = z.object({
  width: intRequired(1, 5000),
  height: intRequired(1, 5000),
  label: z.string().max(30).optional(),
});

const createAdSlotSchema = z.object({
  name: z.string().min(1).max(100),
  // Optional — derived from the name when omitted
  key: z.string().min(1).max(100).optional(),
  section: z.string().min(1).max(50),
  size: sizeSchema,
  position: intish(-100, 100).default(0),
  isActive: booleanish.default(true),
  maxAds: intish(1, 10).default(1),
});

const updateAdSlotSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  key: z.string().min(1).max(100).optional(),
  section: z.string().min(1).max(50).optional(),
  size: sizeSchema.optional(),
  position: intish(-100, 100),
  isActive: booleanish,
  maxAds: intish(1, 10),
});

const adSlotQuerySchema = z.object({
  isActive: z.string().optional(),
  section: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  createAdSlotSchema,
  updateAdSlotSchema,
  adSlotQuerySchema,
};
