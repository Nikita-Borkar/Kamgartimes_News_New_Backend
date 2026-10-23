const z = require("zod");

// Empty string from the admin UI is treated as "no window set"
const dateField = z.preprocess(
  (val) => (val === "" ? null : val),
  z.coerce.date().nullable(),
);

const createNoticeSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  linkUrl: z.string().max(500).optional().default(""),
  linkText: z.string().max(60).optional().default(""),
  kind: z.enum(["NOTICE", "BREAKING"]).optional().default("NOTICE"),
  priority: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
  startsAt: dateField.default(null),
  endsAt: dateField.default(null),
});

const updateNoticeSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  message: z.string().min(1).max(1000).optional(),
  linkUrl: z.string().max(500).optional(),
  linkText: z.string().max(60).optional(),
  kind: z.enum(["NOTICE", "BREAKING"]).optional(),
  priority: z.number().int().optional(),
  isActive: z.boolean().optional(),
  startsAt: dateField.optional(),
  endsAt: dateField.optional(),
});

const noticeQuerySchema = z.object({
  isActive: z.string().optional(),
  kind: z.enum(["NOTICE", "BREAKING"]).optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

const publicNoticeQuerySchema = z.object({
  kind: z.enum(["NOTICE", "BREAKING"]).optional(),
});

module.exports = {
  createNoticeSchema,
  updateNoticeSchema,
  noticeQuerySchema,
  publicNoticeQuerySchema,
};
