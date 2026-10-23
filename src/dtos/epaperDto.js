const z = require("zod");
const mongoose = require("mongoose");

const objectIdString = z
  .string()
  .refine((val) => mongoose.isValidObjectId(val), "Invalid ID");

const createEpaperSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  editionDate: z.coerce.date(),
  city: objectIdString.optional().nullable(),
  pdfUrl: z.string().min(1),
  cloudinaryPublicId: z.string().optional().default(""),
  coverImageUrl: z.string().optional().default(""),
  pageCount: z.coerce.number().optional().nullable(),
  fileSize: z.string().optional().default(""),
  blurb: z.string().optional().default(""),
  isActive: z.boolean().optional().default(true),
});

const updateEpaperSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  editionDate: z.coerce.date().optional(),
  city: objectIdString.optional().nullable(),
  pdfUrl: z.string().min(1).optional(),
  cloudinaryPublicId: z.string().optional(),
  coverImageUrl: z.string().optional(),
  pageCount: z.coerce.number().optional().nullable(),
  fileSize: z.string().optional(),
  blurb: z.string().optional(),
  isActive: z.boolean().optional(),
});

const epaperQuerySchema = z.object({
  isActive: z.string().optional(),
  city: objectIdString.optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

const publicEpaperQuerySchema = z.object({
  citySlug: z.string().trim().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  createEpaperSchema,
  updateEpaperSchema,
  epaperQuerySchema,
  publicEpaperQuerySchema,
};
