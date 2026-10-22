const z = require("zod");

const publicQotdQuerySchema = z.object({
  category: z.string().optional(),
});

const publicQotdAnswerSchema = z.object({
  answer: z.string().min(1, "Answer is required").max(200),
  category: z.string().optional(),
});

module.exports = {
  publicQotdQuerySchema,
  publicQotdAnswerSchema,
};
