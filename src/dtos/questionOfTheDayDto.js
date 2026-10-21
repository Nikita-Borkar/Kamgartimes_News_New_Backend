const z = require("zod");
const mongoose = require("mongoose");

const objectIdString = z
  .string()
  .refine((val) => mongoose.isValidObjectId(val), "Invalid ID");

const createQuestionOfTheDaySchema = z.object({
  question: z.string().nonempty().max(500),
  options: z.array(z.string().nonempty()).optional().default([]),
  correctAnswer: z.string().optional().default(""),
  explanation: z.string().optional().default(""),
  isActive: z.boolean().optional().default(true),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  category: z.string().optional().default(""),
});

const updateQuestionOfTheDaySchema = z.object({
  question: z.string().nonempty().max(500).optional(),
  options: z.array(z.string().nonempty()).optional(),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  category: z.string().optional(),
});

const questionOfTheDayQuerySchema = z.object({
  isActive: z.string().optional(),
  category: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  createQuestionOfTheDaySchema,
  updateQuestionOfTheDaySchema,
  questionOfTheDayQuerySchema,
};
