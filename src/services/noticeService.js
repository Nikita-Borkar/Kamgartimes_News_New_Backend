const mongoose = require("mongoose");
const Notice = require("../models/Notice");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError("Invalid notice ID");
};

const assertValidWindow = (startsAt, endsAt) => {
  if (startsAt && endsAt && new Date(startsAt) > new Date(endsAt)) {
    throw new BadRequestError("endsAt must be after startsAt");
  }
};

const listNotices = async ({ isActive, search, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search) filter.title = { $regex: escapeRegex(search), $options: "i" };

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [notices, total] = await Promise.all([
    Notice.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("createdBy", "name")
      .populate("updatedBy", "name"),
    Notice.countDocuments(filter),
  ]);

  return { notices, total, page: pageNum, limit: limitNum };
};

const getNoticeById = async (id) => {
  assertValidId(id);
  const notice = await Notice.findById(id)
    .populate("createdBy", "name")
    .populate("updatedBy", "name");
  if (!notice) throw new NotFoundError("Notice not found");
  return notice;
};

const createNotice = async (body, userId) => {
  const { title, message, linkUrl, linkText, priority, isActive, startsAt, endsAt } = body;

  assertValidWindow(startsAt, endsAt);

  const notice = await Notice.create({
    title,
    message,
    linkUrl: linkUrl || "",
    linkText: linkText || "",
    priority: priority || 0,
    isActive: isActive !== undefined ? isActive : true,
    startsAt: startsAt || null,
    endsAt: endsAt || null,
    createdBy: userId,
    updatedBy: null,
  });

  return notice;
};

const updateNotice = async (id, body, userId) => {
  assertValidId(id);
  const notice = await Notice.findById(id);
  if (!notice) throw new NotFoundError("Notice not found");

  const { title, message, linkUrl, linkText, priority, isActive, startsAt, endsAt } = body;

  const nextStartsAt = startsAt !== undefined ? startsAt : notice.startsAt;
  const nextEndsAt = endsAt !== undefined ? endsAt : notice.endsAt;
  assertValidWindow(nextStartsAt, nextEndsAt);

  if (title !== undefined) notice.title = title;
  if (message !== undefined) notice.message = message;
  if (linkUrl !== undefined) notice.linkUrl = linkUrl;
  if (linkText !== undefined) notice.linkText = linkText;
  if (priority !== undefined) notice.priority = priority;
  if (isActive !== undefined) notice.isActive = isActive;
  if (startsAt !== undefined) notice.startsAt = startsAt;
  if (endsAt !== undefined) notice.endsAt = endsAt;
  notice.updatedBy = userId;

  await notice.save();
  return notice;
};

const deleteNotice = async (id) => {
  assertValidId(id);
  const notice = await Notice.findById(id);
  if (!notice) throw new NotFoundError("Notice not found");

  await notice.deleteOne();
  return { id };
};

// Public ticker feed: active notices inside their scheduling window,
// highest priority first.
const listActiveNotices = async () => {
  const now = new Date();

  return Notice.find({
    isActive: true,
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
    ],
  })
    .sort({ priority: -1, createdAt: -1 })
    .select("title message linkUrl linkText priority startsAt endsAt createdAt");
};

module.exports = {
  listNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  listActiveNotices,
};
