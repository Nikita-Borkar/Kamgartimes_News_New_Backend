const z = require("zod");
const mongoose = require("mongoose");

const objectIdString = z
  .string()
  .refine((val) => mongoose.isValidObjectId(val), "Invalid ID");

const pollOptionSchema = z.object({
  text: z.string().min(1).max(200),
});

const createPollSchema = z.object({
  question: z.string().min(1).max(500),
  options: z.array(pollOptionSchema).min(2).max(6),
  isActive: z.boolean().optional().default(true),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
});

const updatePollSchema = z.object({
  question: z.string().min(1).max(500).optional(),
  options: z.array(pollOptionSchema).min(2).max(6).optional(),
  isActive: z.boolean().optional(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
});

const pollVoteSchema = z.object({
  optionId: objectIdString,
});

const pollQuerySchema = z.object({
  isActive: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  createPollSchema,
  updatePollSchema,
  pollVoteSchema,
  pollQuerySchema,
};
