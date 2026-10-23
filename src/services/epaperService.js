const mongoose = require("mongoose");
const EpaperEdition = require("../models/EpaperEdition");
const City = require("../models/City");
const slugify = require("../utils/slugify");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");

const assertValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError("Invalid edition ID");
};

const assertCityExists = async (cityId) => {
  if (!cityId) return;
  const city = await City.findById(cityId);
  if (!city) throw new BadRequestError("City not found");
};

const buildSlug = (body) => {
  const base = slugify(body.slug || body.title);
  if (base) return base;
  if (body.editionDate) {
    return new Date(body.editionDate).toISOString().slice(0, 10);
  }
  return "";
};

const listEditions = async ({ isActive, city, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true" || isActive === true;
  if (city) {
    if (!mongoose.isValidObjectId(city)) throw new BadRequestError("Invalid city ID");
    filter.city = city;
  }

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

  const [editions, total] = await Promise.all([
    EpaperEdition.find(filter)
      .sort({ editionDate: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("city", "name slug")
      .lean(),
    EpaperEdition.countDocuments(filter),
  ]);

  return { editions, total, page: pageNum, limit: limitNum };
};

const listPublicEditions = async ({ citySlug, page = 1, limit = 12 } = {}) => {
  const filter = { isActive: true };

  if (citySlug) {
    const city = await City.findOne({ slug: citySlug.toLowerCase() }).select("_id");
    if (!city) throw new NotFoundError("City not found");
    filter.city = city._id;
  }

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 12, 1), 50);

  const [editions, total] = await Promise.all([
    EpaperEdition.find(filter)
      .sort({ editionDate: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select("title slug editionDate pdfUrl coverImageUrl pageCount fileSize blurb city")
      .populate("city", "name slug")
      .lean(),
    EpaperEdition.countDocuments(filter),
  ]);

  return {
    editions,
    latest: editions[0] || null,
    total,
    page: pageNum,
    limit: limitNum,
  };
};

const getEditionById = async (id) => {
  assertValidId(id);
  const edition = await EpaperEdition.findById(id)
    .populate("city", "name slug")
    .populate("createdBy", "name");
  if (!edition) throw new NotFoundError("E-paper edition not found");
  return edition;
};

const getPublicEditionBySlug = async (slug) => {
  const edition = await EpaperEdition.findOne({ slug: slug.toLowerCase(), isActive: true })
    .select("title slug editionDate pdfUrl coverImageUrl pageCount fileSize blurb city")
    .populate("city", "name slug")
    .lean();
  if (!edition) throw new NotFoundError("E-paper edition not found");
  return edition;
};

const createEdition = async (body, userId) => {
  const finalSlug = buildSlug(body);
  if (!finalSlug) throw new BadRequestError("Could not generate a slug for this edition");

  const existing = await EpaperEdition.findOne({ slug: finalSlug });
  if (existing) throw new BadRequestError("An edition with this slug already exists");

  await assertCityExists(body.city);

  return EpaperEdition.create({
    ...body,
    slug: finalSlug,
    city: body.city || null,
    createdBy: userId,
    updatedBy: null,
  });
};

const updateEdition = async (id, body, userId) => {
  assertValidId(id);
  const edition = await EpaperEdition.findById(id);
  if (!edition) throw new NotFoundError("E-paper edition not found");

  if (body.city !== undefined) {
    await assertCityExists(body.city);
    edition.city = body.city || null;
  }

  if (body.slug !== undefined || body.title !== undefined) {
    const finalSlug = buildSlug({ ...body, title: body.title || edition.title });
    if (!finalSlug) throw new BadRequestError("Invalid slug");
    const existing = await EpaperEdition.findOne({ slug: finalSlug, _id: { $ne: id } });
    if (existing) throw new BadRequestError("An edition with this slug already exists");
    edition.slug = finalSlug;
  }

  for (const field of [
    "title",
    "editionDate",
    "pdfUrl",
    "cloudinaryPublicId",
    "coverImageUrl",
    "pageCount",
    "fileSize",
    "blurb",
    "isActive",
  ]) {
    if (body[field] !== undefined) edition[field] = body[field];
  }

  edition.updatedBy = userId;
  await edition.save();
  return edition;
};

const deleteEdition = async (id) => {
  assertValidId(id);
  const edition = await EpaperEdition.findById(id);
  if (!edition) throw new NotFoundError("E-paper edition not found");

  edition.isActive = false;
  await edition.save();
  return { id, isActive: edition.isActive };
};

module.exports = {
  listEditions,
  listPublicEditions,
  getEditionById,
  getPublicEditionBySlug,
  createEdition,
  updateEdition,
  deleteEdition,
};
