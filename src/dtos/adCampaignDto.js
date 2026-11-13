const z = require("zod");
const {
  booleanish,
  intish,
  enumish,
  startDateField,
  endDateField,
} = require("./adShared");

// Absolute http(s) URL or a root-relative path on the reader site
const clickUrl = z
  .string()
  .min(1)
  .max(500)
  .refine(
    (val) => /^https?:\/\/\S+$/i.test(val.trim()) || val.trim().startsWith("/"),
    "Must be an http(s) URL or a path starting with /",
  );

const mediaTypeField = z.preprocess((val) => {
  if (!val) return "IMAGE";
  const str = String(val).trim().toUpperCase();
  return str === "VIDEO" ? "VIDEO" : "IMAGE";
}, z.enum(["IMAGE", "VIDEO"]));

const videoUrlField = z.preprocess(
  (val) => (val === null || val === undefined ? "" : String(val).trim()),
  z.string().max(1000).optional(),
);

// The image/video file itself is handled by the upload middleware and checked
// in the service — these schemas validate the accompanying text fields,
// which arrive as strings on multipart requests.
const createAdCampaignSchema = z.object({
  title: z.string().min(1).max(200),
  clickUrl,
  imageAlt: z.string().max(300).default(""),
  mediaType: mediaTypeField.default("IMAGE"),
  videoUrl: videoUrlField.default(""),
  target: enumish(["_blank", "_self"]).default("_blank"),
  priority: intish(-1000, 1000).default(0),
  isActive: booleanish.default(true),
  startDate: startDateField.default(null),
  endDate: endDateField.default(null),
});

const updateAdCampaignSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  clickUrl: clickUrl.optional(),
  imageAlt: z.string().max(300).optional(),
  mediaType: mediaTypeField.optional(),
  videoUrl: videoUrlField.optional(),
  target: enumish(["_blank", "_self"]),
  priority: intish(-1000, 1000),
  isActive: booleanish,
  startDate: startDateField.optional(),
  endDate: endDateField.optional(),
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
