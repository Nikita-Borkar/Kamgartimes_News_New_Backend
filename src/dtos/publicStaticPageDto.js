const z = require("zod");

const publicStaticPageParamSchema = z.object({
  slug: z.string().min(1),
});

const publicStaticPageQuerySchema = z.object({
  showInHeader: z.string().optional(),
  showInFooter: z.string().optional(),
});

module.exports = {
  publicStaticPageParamSchema,
  publicStaticPageQuerySchema,
};
