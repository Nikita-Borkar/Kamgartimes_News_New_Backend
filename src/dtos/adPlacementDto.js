const z = require("zod");
const mongoose = require("mongoose");
const { emptyToUndefined, booleanish, intish, dateField } = require("./adShared");

const objectIdString = z
  .string()
  .refine((val) => mongoose.isValidObjectId(val), "Invalid ID");

const createAdPlacementSchema = z.object({
  adSlot: z.preprocess(emptyToUndefined, objectIdString),
  adCampaign: z.preprocess(emptyToUndefined, objectIdString),
  startDate: dateField.default(null),
  endDate: dateField.default(null),
  isActive: booleanish.default(true),
  weight: intish(1, 100).default(1),
});

const updateAdPlacementSchema = z.object({
  adSlot: z.preprocess(emptyToUndefined, objectIdString.optional()),
  adCampaign: z.preprocess(emptyToUndefined, objectIdString.optional()),
  startDate: dateField.optional(),
  endDate: dateField.optional(),
  isActive: booleanish,
  weight: intish(1, 100),
});

const adPlacementQuerySchema = z.object({
  adSlot: z.preprocess(emptyToUndefined, objectIdString.optional()),
  adCampaign: z.preprocess(emptyToUndefined, objectIdString.optional()),
  isActive: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  createAdPlacementSchema,
  updateAdPlacementSchema,
  adPlacementQuerySchema,
};
