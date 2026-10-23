const z = require("zod");
const mongoose = require("mongoose");

const objectIdString = z
  .string()
  .refine((val) => mongoose.isValidObjectId(val), "Invalid ID");

const galleryImageSchema = z.object({
  imageUrl: z.string().min(1),
  cloudinaryPublicId: z.string().optional().default(""),
  caption: z.string().optional().default(""),
  altText: z.string().optional().default(""),
});

const createGallerySchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().optional().default(""),
  coverImage: z.string().optional().default(""),
  category: objectIdString.optional().nullable(),
  images: z.array(galleryImageSchema).optional().default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional().default("DRAFT"),
});

const updateGallerySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  category: objectIdString.optional().nullable(),
  images: z.array(galleryImageSchema).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

const galleryQuerySchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  category: objectIdString.optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

const publicGalleryQuerySchema = z.object({
  categorySlug: z.string().trim().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  createGallerySchema,
  updateGallerySchema,
  galleryQuerySchema,
  publicGalleryQuerySchema,
};
