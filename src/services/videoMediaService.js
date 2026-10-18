const mongoose = require("mongoose");
const Videos = require("../models/VideoMedia");
const Category = require("../models/Category");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError("Invalid video ID");
};

// Extracts the 11-character video ID from any common YouTube URL shape
// (watch, youtu.be, shorts, embed, live) or a raw ID.
const extractYoutubeId = (input) => {
  const value = (input || "").trim();
  const patterns = [
    /youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{11})/i,
    /youtu\.be\/([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/live\/([A-Za-z0-9_-]{11})/i,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }
  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;
  return null;
};

const buildEmbedAndThumb = (videoId) => ({
  thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
});

const listVideos = async ({ status, category, search, page = 1, limit = 20 }) => {
  const filter = {};
  if (status) filter.status = status;
  if (category) {
    if (!mongoose.isValidObjectId(category)) throw new BadRequestError("Invalid category ID");
    filter.category = category;
  }
  if (search) filter.title = { $regex: escapeRegex(search), $options: "i" };

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [videos, total] = await Promise.all([
    Videos.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("category", "name slug")
      .populate("user", "name"),
    Videos.countDocuments(filter),
  ]);

  return { videos, total, page: pageNum, limit: limitNum };
};

const getVideoById = async (id) => {
  assertValidId(id);
  const video = await Videos.findById(id)
    .populate("category", "name slug")
    .populate("user", "name");
  if (!video) throw new NotFoundError("Video not found");
  return video;
};

const createVideo = async (meta, userId) => {
  const videoId = extractYoutubeId(meta.youtubeUrl);
  if (!videoId) throw new BadRequestError("Could not extract a YouTube video ID from the URL");

  const category = await Category.findById(meta.category);
  if (!category) throw new BadRequestError("Category not found");

  return Videos.create({
    title: meta.title,
    altText: meta.altText || "",
    youtubeUrl: meta.youtubeUrl.trim(),
    youtubeVideoID: videoId,
    thumbnailUrl: buildEmbedAndThumb(videoId).thumbnailUrl,
    videoType: meta.videoType,
    category: meta.category,
    user: userId,
    status: meta.status || "DRAFT",
  });
};

const updateVideo = async (id, meta) => {
  assertValidId(id);
  const video = await Videos.findById(id);
  if (!video) throw new NotFoundError("Video not found");

  if (meta.youtubeUrl !== undefined) {
    const videoId = extractYoutubeId(meta.youtubeUrl);
    if (!videoId) throw new BadRequestError("Could not extract a YouTube video ID from the URL");
    video.youtubeUrl = meta.youtubeUrl.trim();
    video.youtubeVideoID = videoId;
    video.thumbnailUrl = buildEmbedAndThumb(videoId).thumbnailUrl;
  }

  if (meta.category !== undefined) {
    const category = await Category.findById(meta.category);
    if (!category) throw new BadRequestError("Category not found");
    video.category = meta.category;
  }

  if (meta.title !== undefined) video.title = meta.title;
  if (meta.altText !== undefined) video.altText = meta.altText;
  if (meta.videoType !== undefined) video.videoType = meta.videoType;
  if (meta.status !== undefined) video.status = meta.status;

  await video.save();
  return video;
};

// YouTube videos live on YouTube — only the database record is removed
const deleteVideo = async (id) => {
  assertValidId(id);
  const video = await Videos.findById(id);
  if (!video) throw new NotFoundError("Video not found");

  await video.deleteOne();
  return { id, deleted: true };
};

module.exports = {
  extractYoutubeId,
  listVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
};
