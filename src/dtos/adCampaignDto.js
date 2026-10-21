const z = require("zod");
const { booleanish, intish, enumish, dateField } = require("./adShared");

// Absolute http(s) URL or a root-relative path on the reader site
const clickUrl = z
  .string()
  .min(1)
  .max(500)
  .refine(
    (val) => /^https?:\/\/\S+$/i.test(val.trim()) || val.trim().startsWith("/"),
    "Must be an http(s) URL or a path starting with /",
  );

// The image file itself is handled by the upload middleware and checked
// in the service — these schemas validate the accompanying text fields,
// which arrive as strings on multipart requests.
const createAdCampaignSchema = z.object({
  title: z.string().min(1).max(200),
  clickUrl,
  imageAlt: z.string().max(300).default(""),
  target: enumish(["_blank", "_self"]).default("_blank"),
  priority: intish(-1000, 1000).default(0),
  isActive: booleanish.default(true),
  startDate: dateField.default(null),
  endDate: dateField.default(null),
});

const updateAdCampaignSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  clickUrl: clickUrl.optional(),
  imageAlt: z.string().max(300).optional(),
  target: enumish(["_blank", "_self"]),
  priority: intish(-1000, 1000),
  isActive: booleanish,
  startDate: dateField.optional(),
  endDate: dateField.optional(),
});

const adCampaignQuerySchema = z.object({
  isActive: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  createAdCampaignSchema,
  updateAdCampaignSchema,
  adCampaignQuerySchema,
};
