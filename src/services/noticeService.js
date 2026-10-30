const mongoose = require("mongoose");
const Notice = require("../models/Notice");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");
const { notifyPushSubscribers } = require("./pushNotificationService");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError("Invalid notice ID");
};

const assertValidWindow = (startsAt, endsAt) => {
  if (startsAt && endsAt && new Date(startsAt) > new Date(endsAt)) {
    throw new BadRequestError("endsAt must be after startsAt");
  }
};

const isNoticeLive = (notice, now = new Date()) =>
  Boolean(
    notice.isActive &&
      (!notice.startsAt || new Date(notice.startsAt) <= now) &&
      (!notice.endsAt || new Date(notice.endsAt) >= now),
  );

const notifyNotice = (notice) =>
  notifyPushSubscribers({
    title: notice.kind === "BREAKING" ? "Breaking News" : "Kamgar Times Notice",
    body: notice.message,
    url: notice.linkUrl || "/",
  });

const listNotices = async ({ isActive, kind, search, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (kind) filter.kind = kind;
  if (search) {
    filter.message = { $regex: escapeRegex(search), $options: "i" };
  }

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [notices, total] = await Promise.all([
    Notice.find(filter)
      .sort({ createdAt: -1 })
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
  const { message, linkUrl, kind, isActive, startsAt, endsAt } = body;

  assertValidWindow(startsAt, endsAt);

  const notice = await Notice.create({
    message,
    linkUrl: linkUrl || "",
    kind: kind || "NOTICE",
    isActive: isActive !== undefined ? isActive : true,
    startsAt: startsAt || null,
    endsAt: endsAt || null,
    createdBy: userId,
    updatedBy: null,
  });

  if (isNoticeLive(notice)) notifyNotice(notice);

  return notice;
};

const updateNotice = async (id, body, userId) => {
  assertValidId(id);
  const notice = await Notice.findById(id);
  if (!notice) throw new NotFoundError("Notice not found");
  const wasLive = isNoticeLive(notice);

  const { message, linkUrl, kind, isActive, startsAt, endsAt } = body;

  const nextStartsAt = startsAt !== undefined ? startsAt : notice.startsAt;
  const nextEndsAt = endsAt !== undefined ? endsAt : notice.endsAt;
  assertValidWindow(nextStartsAt, nextEndsAt);

  if (message !== undefined) notice.message = message;
  if (linkUrl !== undefined) notice.linkUrl = linkUrl;
  if (kind !== undefined) notice.kind = kind;
  if (isActive !== undefined) notice.isActive = isActive;
  if (startsAt !== undefined) notice.startsAt = startsAt;
  if (endsAt !== undefined) notice.endsAt = endsAt;
  notice.updatedBy = userId;

  await notice.save();
  if (!wasLive && isNoticeLive(notice)) notifyNotice(notice);
  return notice;
};

const deleteNotice = async (id) => {
  assertValidId(id);
  const notice = await Notice.findById(id);
  if (!notice) throw new NotFoundError("Notice not found");

  await notice.deleteOne();
  return { id };
};

// Public ticker feed: active notices inside their scheduling window, latest first.
const listActiveNotices = async ({ kind } = {}) => {
  const now = new Date();
  const filter = {
    isActive: true,
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
    ],
  };
  if (kind) filter.kind = kind;

  return Notice.find(filter)
    .sort({ createdAt: -1 })
    .select("message linkUrl kind startsAt endsAt createdAt");
};

module.exports = {
  listNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  listActiveNotices,
};
