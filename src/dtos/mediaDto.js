const z = require("zod");
const mongoose = require("mongoose");

const objectIdString = z
  .string()
  .refine((val) => mongoose.isValidObjectId(val), "Invalid ID");

const mediaStatus = z.enum(["DRAFT", "PUBLISHED"]).optional();

// Image create fields arrive as multipart text fields alongside the file
const createImageSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().default(""),
  altText: z.string().max(300).optional().default(""),
  status: mediaStatus.default("DRAFT"),
});

const updateImageSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  altText: z.string().max(300).optional(),
  status: mediaStatus,
});

const createVideoSchema = z.object({
  title: z.string().min(1).max(200),
  altText: z.string().max(300).optional().default(""),
  youtubeUrl: z
    .string()
    .min(1)
    .refine(
      (val) => /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(val.trim()),
      "Must be a valid YouTube URL",
    ),
  videoType: z.enum(["SHORT", "VIDEO"]),
  category: objectIdString,
  status: mediaStatus.default("DRAFT"),
});

const updateVideoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  altText: z.string().max(300).optional(),
  youtubeUrl: z
    .string()
    .min(1)
    .refine(
      (val) => /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(val.trim()),
      "Must be a valid YouTube URL",
    )
    .optional(),
  videoType: z.enum(["SHORT", "VIDEO"]).optional(),
  category: objectIdString.optional(),
  status: mediaStatus,
});

const mediaQuerySchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  category: objectIdString.optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  createImageSchema,
  updateImageSchema,
  createVideoSchema,
  updateVideoSchema,
  mediaQuerySchema,
};
