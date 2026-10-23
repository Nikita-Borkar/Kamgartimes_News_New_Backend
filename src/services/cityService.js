const mongoose = require("mongoose");
const City = require("../models/City");
const slugify = require("../utils/slugify");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");

const assertValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError("Invalid city ID");
};

const listCities = async ({ isActive, page = 1, limit = 50 } = {}) => {
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true" || isActive === true;

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 50, 1), 100);

  const [cities, total] = await Promise.all([
    City.find(filter)
      .sort({ order: 1, name: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    City.countDocuments(filter),
  ]);

  return { cities, total, page: pageNum, limit: limitNum };
};

const listPublicCities = async () => {
  const cities = await City.find({ isActive: true })
    .sort({ order: 1, name: 1 })
    .select("name slug state description coverImage order")
    .lean();
  return { cities, total: cities.length };
};

const getCityById = async (id) => {
  assertValidId(id);
  const city = await City.findById(id);
  if (!city) throw new NotFoundError("City not found");
  return city;
};

const getPublicCityBySlug = async (slug) => {
  const city = await City.findOne({ slug: slug.toLowerCase(), isActive: true })
    .select("name slug state description coverImage order")
    .lean();
  if (!city) throw new NotFoundError("City not found");
  return city;
};

const createCity = async (body) => {
  const finalSlug = slugify(body.slug || body.name);
  if (!finalSlug) throw new BadRequestError("Could not generate a slug from the name");

  const existing = await City.findOne({
    $or: [{ slug: finalSlug }, { name: body.name }],
  });
  if (existing) throw new BadRequestError("A city with this name or slug already exists");

  return City.create({ ...body, slug: finalSlug });
};

const updateCity = async (id, body) => {
  assertValidId(id);
  const city = await City.findById(id);
  if (!city) throw new NotFoundError("City not found");

  if (body.name !== undefined) city.name = body.name;
  if (body.state !== undefined) city.state = body.state;
  if (body.description !== undefined) city.description = body.description;
  if (body.coverImage !== undefined) city.coverImage = body.coverImage;
  if (body.isActive !== undefined) city.isActive = body.isActive;
  if (body.order !== undefined) city.order = body.order;

  if (body.slug !== undefined || body.name !== undefined) {
    const finalSlug = slugify(body.slug || body.name);
    if (!finalSlug) throw new BadRequestError("Invalid slug");
    const existing = await City.findOne({
      _id: { $ne: id },
      $or: [{ slug: finalSlug }, { name: city.name }],
    });
    if (existing) throw new BadRequestError("A city with this name or slug already exists");
    city.slug = finalSlug;
  }

  await city.save();
  return city;
};

const deleteCity = async (id) => {
  assertValidId(id);
  const city = await City.findById(id);
  if (!city) throw new NotFoundError("City not found");

  city.isActive = false;
  await city.save();
  return { id, isActive: city.isActive };
};

module.exports = {
  listCities,
  listPublicCities,
  getCityById,
  getPublicCityBySlug,
  createCity,
  updateCity,
  deleteCity,
};
