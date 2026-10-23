const z = require("zod");
const mongoose = require("mongoose");
const { emptyToUndefined, dateField } = require("./adShared");

const objectIdString = z
  .string()
  .refine((val) => mongoose.isValidObjectId(val), "Invalid ID");

// GET /public/ads?slot=hero_leaderboard
const publicAdQuerySchema = z.object({
  slot: z.string().min(1).max(100),
});

// POST /public/ads/click
const adClickSchema = z.object({
  adCampaignId: z.preprocess(emptyToUndefined, objectIdString),
  adSlotId: z.preprocess(emptyToUndefined, objectIdString),
});

// POST /public/ads/impression
const adImpressionSchema = z.object({
  adCampaignId: z.preprocess(emptyToUndefined, objectIdString),
  adSlotId: z.preprocess(emptyToUndefined, objectIdString),
});

// GET /ad-stats/clicks
const adClickStatsQuerySchema = z.object({
  campaign: z.preprocess(emptyToUndefined, objectIdString.optional()),
  slot: z.preprocess(emptyToUndefined, objectIdString.optional()),
  from: z.preprocess(emptyToUndefined, dateField.optional()),
  to: z.preprocess(emptyToUndefined, dateField.optional()),
});

module.exports = {
  publicAdQuerySchema,
  adClickSchema,
  adImpressionSchema,
  adClickStatsQuerySchema,
};
