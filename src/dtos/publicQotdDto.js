const z = require("zod");

const publicQotdQuerySchema = z.object({
  category: z.string().optional(),
});

module.exports = {
  publicQotdQuerySchema,
};
