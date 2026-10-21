const z = require("zod");

const publicStaticPageParamSchema = z.object({
  slug: z.string().nonempty(),
});

module.exports = {
  publicStaticPageParamSchema,
};
