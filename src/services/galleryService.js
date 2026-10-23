const mongoose = require("mongoose");
const Gallery = require("../models/Gallery");
const Category = require("../models/Category");
const slugify = require("../utils/slugify");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError("Invalid gallery ID");
};

const assertCategoryExists = async (categoryId) => {
  if (!categoryId) return;
  const category = await Category.findById(categoryId);
  if (!category) throw new BadRequestError("Category not found");
};

const applyCover = (images, coverImage) =>
  coverImage || (images?.length ? images[0].imageUrl : "");

const listGalleries = async ({
  status,
  category,
  search,
  page = 1,
  limit = 20,
} = {}) => {
  const filter = {};
  if (status) filter.status = status;
  if (category) {
    if (!mongoose.isValidObjectId(category)) throw new BadRequestError("Invalid category ID");
    filter.category = category;
  }
  if (search) {
    const rx = { $regex: escapeRegex(search), $options: "i" };
    filter.$or = [{ title: rx }, { description: rx }];
  }

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

  const [galleries, total] = await Promise.all([
    Gallery.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("category", "name slug")
      .populate("createdBy", "name")
      .lean(),
    Gallery.countDocuments(filter),
  ]);

  return { galleries, total, page: pageNum, limit: limitNum };
};

const listPublicGalleries = async ({ categorySlug, page = 1, limit = 12 } = {}) => {
  const filter = { status: "PUBLISHED" };

  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug.toLowerCase() }).select("_id");
    if (!category) throw new NotFoundError("Category not found");
    filter.category = category._id;
  }

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 12, 1), 50);

  const [galleries, total] = await Promise.all([
    Gallery.find(filter)
      .sort({ publishedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select("title slug description coverImage images category publishedAt")
      .populate("category", "name slug")
      .lean(),
    Gallery.countDocuments(filter),
  ]);

  return { galleries, total, page: pageNum, limit: limitNum };
};

const getGalleryById = async (id) => {
  assertValidId(id);
  const gallery = await Gallery.findById(id)
    .populate("category", "name slug")
    .populate("createdBy", "name")
    .populate("updatedBy", "name");
  if (!gallery) throw new NotFoundError("Gallery not found");
  return gallery;
};

const getPublicGalleryBySlug = async (slug) => {
  const gallery = await Gallery.findOne({ slug: slug.toLowerCase(), status: "PUBLISHED" })
    .select("-createdBy -updatedBy -__v")
    .populate("category", "name slug")
    .lean();
  if (!gallery) throw new NotFoundError("Gallery not found");
  return gallery;
};

const createGallery = async (body, userId) => {
  const finalSlug = slugify(body.slug || body.title);
  if (!finalSlug) throw new BadRequestError("Could not generate a slug from the title");

  const existing = await Gallery.findOne({ slug: finalSlug });
  if (existing) throw new BadRequestError("A gallery with this slug already exists");

  await assertCategoryExists(body.category);

  return Gallery.create({
    ...body,
    slug: finalSlug,
    category: body.category || null,
    coverImage: applyCover(body.images, body.coverImage),
    publishedAt: body.status === "PUBLISHED" ? new Date() : null,
    createdBy: userId,
    updatedBy: null,
  });
};

const updateGallery = async (id, body, userId) => {
  assertValidId(id);
  const gallery = await Gallery.findById(id);
  if (!gallery) throw new NotFoundError("Gallery not found");

  if (body.category !== undefined) {
    await assertCategoryExists(body.category);
    gallery.category = body.category || null;
  }

  if (body.slug !== undefined || body.title !== undefined) {
    const finalSlug = slugify(body.slug || body.title);
    if (!finalSlug) throw new BadRequestError("Invalid slug");
    const existing = await Gallery.findOne({ slug: finalSlug, _id: { $ne: id } });
    if (existing) throw new BadRequestError("A gallery with this slug already exists");
    gallery.slug = finalSlug;
  }

  if (body.title !== undefined) gallery.title = body.title;
  if (body.description !== undefined) gallery.description = body.description;
  if (body.images !== undefined) gallery.images = body.images;
  if (body.coverImage !== undefined || body.images !== undefined) {
    gallery.coverImage = applyCover(gallery.images, body.coverImage);
  }

  if (body.status !== undefined) {
    gallery.status = body.status;
    if (body.status === "PUBLISHED" && !gallery.publishedAt) {
      gallery.publishedAt = new Date();
    }
    if (body.status === "DRAFT") gallery.publishedAt = null;
  }

  gallery.updatedBy = userId;
  await gallery.save();
  return gallery;
};

const deleteGallery = async (id) => {
  assertValidId(id);
  const gallery = await Gallery.findById(id);
  if (!gallery) throw new NotFoundError("Gallery not found");

  await gallery.deleteOne();
  return { id, deleted: true };
};

module.exports = {
  listGalleries,
  listPublicGalleries,
  getGalleryById,
  getPublicGalleryBySlug,
  createGallery,
  updateGallery,
  deleteGallery,
};
