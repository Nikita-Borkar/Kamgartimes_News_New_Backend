const mongoose = require("mongoose");
const LiveNews = require("../models/LiveNews");
const Category = require("../models/Category");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");

const assertValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError("Invalid live news ID");
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const listLiveNews = async ({
  isActive,
  category,
  search,
  page = 1,
  limit = 20,
} = {}) => {
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (category) {
    assertValidId(category);
    filter.category = category;
  }
  if (search) {
    const rx = { $regex: escapeRegex(search), $options: "i" };
    filter.heading = rx;
  }

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    LiveNews.find(filter)
      .sort({ priority: -1, publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("category", "name slug")
      .populate("createdBy", "name")
      .populate("updatedBy", "name"),
    LiveNews.countDocuments(filter),
  ]);

  return { items, total, page: pageNum, limit: limitNum };
};

const getLiveNewsById = async (id) => {
  assertValidId(id);
  const item = await LiveNews.findById(id)
    .populate("category", "name slug")
    .populate("createdBy", "name")
    .populate("updatedBy", "name");
  if (!item) throw new NotFoundError("Live news not found");
  return item;
};

const createLiveNews = async (body, userId) => {
  const { heading, linkText, linkUrl, category, isActive, priority, publishedAt } =
    body;

  const categoryExists = await Category.exists({ _id: category });
  if (!categoryExists) throw new NotFoundError("Category not found");

  const item = await LiveNews.create({
    heading,
    linkText: linkText || "Read More",
    linkUrl,
    category,
    isActive: isActive !== undefined ? isActive : true,
    priority: priority || 0,
    publishedAt: publishedAt || null,
    createdBy: userId,
    updatedBy: null,
  });

  return item;
};

const updateLiveNews = async (id, body, userId) => {
  assertValidId(id);
  const item = await LiveNews.findById(id);
  if (!item) throw new NotFoundError("Live news not found");

  const {
    heading,
    linkText,
    linkUrl,
    category,
    isActive,
    priority,
    publishedAt,
  } = body;

  if (category !== undefined) {
    const categoryExists = await Category.exists({ _id: category });
    if (!categoryExists) throw new NotFoundError("Category not found");
    item.category = category;
  }
  if (heading !== undefined) item.heading = heading;
  if (linkText !== undefined) item.linkText = linkText;
  if (linkUrl !== undefined) item.linkUrl = linkUrl;
  if (isActive !== undefined) item.isActive = isActive;
  if (priority !== undefined) item.priority = priority;
  if (publishedAt !== undefined) item.publishedAt = publishedAt;
  item.updatedBy = userId;

  await item.save();
  return item;
};

const deleteLiveNews = async (id) => {
  assertValidId(id);
  const item = await LiveNews.findById(id);
  if (!item) throw new NotFoundError("Live news not found");

  await item.deleteOne();
  return { id };
};

// Public: active live news whose publishing window has started (or none set)
const listActiveLiveNews = async ({ limit = 20 } = {}) => {
  const now = new Date();
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 50);

  return LiveNews.find({
    isActive: true,
    $or: [{ publishedAt: null }, { publishedAt: { $lte: now } }],
  })
    .sort({ priority: -1, publishedAt: -1 })
    .limit(limitNum)
    .select("heading linkText linkUrl category priority publishedAt createdAt")
    .populate("category", "name slug");
};

module.exports = {
  listLiveNews,
  getLiveNewsById,
  createLiveNews,
  updateLiveNews,
  deleteLiveNews,
  listActiveLiveNews,
};