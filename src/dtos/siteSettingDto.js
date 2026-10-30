const z = require("zod");

const socialLinkSchema = z.object({
  platform: z.string().trim().min(1).max(50).transform((platform) => platform.toLowerCase()),
  url: z.string().nonempty().url("Invalid URL"),
  icon: z.string().optional().default(""),
});

const updateSiteSettingSchema = z.object({
  logoVariant: z.enum(["light", "dark"]).optional(),
  siteName: z.string().nonempty().max(100).optional(),
  tagline: z.string().max(200).optional(),
  contactEmail: z
    .string()
    .trim()
    .email("Invalid email")
    .or(z.literal(""))
    .optional()
    .nullable(),
  contactPhone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  isMaintenanceMode: z.boolean().optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
});

module.exports = {
  updateSiteSettingSchema,
  socialLinkSchema,
};
