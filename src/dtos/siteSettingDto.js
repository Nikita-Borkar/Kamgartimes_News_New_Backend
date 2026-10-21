const z = require("zod");

const socialLinkSchema = z.object({
  platform: z.enum([
    "youtube",
    "facebook",
    "instagram",
    "whatsapp",
    "twitter",
  ]),
  url: z.string().nonempty().url("Invalid URL"),
  icon: z.string().optional().default(""),
});

const updateSiteSettingSchema = z.object({
  siteName: z.string().nonempty().max(100).optional(),
  tagline: z.string().max(200).optional().default(""),
  contactEmail: z
    .string()
    .email("Invalid email")
    .optional()
    .nullable()
    .default(""),
  contactPhone: z.string().optional().nullable().default(""),
  address: z.string().optional().nullable().default(""),
  isMaintenanceMode: z.boolean().optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
});

module.exports = {
  updateSiteSettingSchema,
  socialLinkSchema,
};
