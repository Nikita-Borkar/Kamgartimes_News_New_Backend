const mongoose = require("mongoose");
const AdCampaign = require("../models/AdCampaign");
const { uploadBuffer, destroyAsset } = require("../config/cloudinary");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError("Invalid ad campaign ID");
};

const assertValidWindow = (startDate, endDate) => {
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new BadRequestError("endDate must be after startDate");
  }
};

const listAdCampaigns = async ({ isActive, search, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search) filter.title = { $regex: escapeRegex(search), $options: "i" };

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [campaigns, total] = await Promise.all([
    AdCampaign.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("createdBy", "name")
      .populate("updatedBy", "name"),
    AdCampaign.countDocuments(filter),
  ]);

  return { campaigns, total, page: pageNum, limit: limitNum };
};

const getAdCampaignById = async (id) => {
  assertValidId(id);
  const campaign = await AdCampaign.findById(id)
    .populate("createdBy", "name")
    .populate("updatedBy", "name");
  if (!campaign) throw new NotFoundError("Ad campaign not found");
  return campaign;
};

const uploadCampaignMedia = async (file, isVideo = false) => {
  if (!file || !file.buffer) throw new BadRequestError("Campaign media file is required");
  try {
    return await uploadBuffer(file.buffer, {
      folder: "kamgartimes/ads",
      resource_type: isVideo ? "video" : "image",
    });
  } catch (err) {
    throw new BadRequestError(`Cloudinary upload failed: ${err.message}`);
  }
};

const createAdCampaign = async (file, body, userId) => {
  const {
    title,
    clickUrl,
    imageAlt,
    target,
    priority,
    isActive,
    startDate,
    endDate,
    mediaType: rawMediaType,
    videoUrl: rawVideoUrl,
  } = body;

  assertValidWindow(startDate, endDate);

  const mediaType = (rawMediaType || "IMAGE").toUpperCase() === "VIDEO" ? "VIDEO" : "IMAGE";
  const videoUrl = rawVideoUrl ? String(rawVideoUrl).trim() : "";

  let uploaded = null;
  let isVideoUpload = false;

  if (file && file.buffer) {
    isVideoUpload = (file.mimetype && file.mimetype.startsWith("video/")) || mediaType === "VIDEO";
    uploaded = await uploadCampaignMedia(file, isVideoUpload);
  } else if (mediaType === "VIDEO" && videoUrl) {
    // Direct video URL without file upload
  } else {
    throw new BadRequestError("Campaign media file (image or video) or video URL is required");
  }

  try {
    let finalMediaType = mediaType;
    let finalImageUrl = "";
    let finalVideoUrl = videoUrl;
    let finalPublicId = "";
    let finalVideoPublicId = "";
    let imageWidth = null;
    let imageHeight = null;

    if (uploaded) {
      if (isVideoUpload) {
        finalMediaType = "VIDEO";
        finalVideoUrl = uploaded.secure_url;
        finalVideoPublicId = uploaded.public_id;
        finalImageUrl = uploaded.secure_url.replace(/\.[^.]+$/, ".jpg");
        imageWidth = uploaded.width || null;
        imageHeight = uploaded.height || null;
      } else {
        finalMediaType = "IMAGE";
        finalImageUrl = uploaded.secure_url;
        finalPublicId = uploaded.public_id;
        imageWidth = uploaded.width || null;
        imageHeight = uploaded.height || null;
      }
    } else {
      finalMediaType = "VIDEO";
      finalVideoUrl = videoUrl;
      finalImageUrl = videoUrl;
    }

    return await AdCampaign.create({
      title,
      clickUrl,
      imageAlt: imageAlt || "",
      target: target || "_blank",
      priority: priority || 0,
      isActive: isActive !== undefined ? isActive : true,
      startDate: startDate || null,
      endDate: endDate || null,
      mediaType: finalMediaType,
      imageUrl: finalImageUrl,
      videoUrl: finalVideoUrl,
      cloudinaryPublicId: finalPublicId,
      cloudinaryVideoPublicId: finalVideoPublicId,
      imageWidth,
      imageHeight,
      createdBy: userId,
    });
  } catch (err) {
    if (uploaded) {
      await destroyAsset(uploaded.public_id, isVideoUpload ? "video" : "image").catch(() => {});
    }
    throw err;
  }
};

const updateAdCampaign = async (id, body, userId, file) => {
  assertValidId(id);
  const campaign = await AdCampaign.findById(id);
  if (!campaign) throw new NotFoundError("Ad campaign not found");

  const {
    title,
    clickUrl,
    imageAlt,
    target,
    priority,
    isActive,
    startDate,
    endDate,
    mediaType: rawMediaType,
    videoUrl: rawVideoUrl,
  } = body;

  const nextStartsAt = startDate !== undefined ? startDate : campaign.startDate;
  const nextEndsAt = endDate !== undefined ? endDate : campaign.endDate;
  assertValidWindow(nextStartsAt, nextEndsAt);

  let uploaded = null;
  let isVideoUpload = false;

  const targetMediaType = rawMediaType
    ? (String(rawMediaType).trim().toUpperCase() === "VIDEO" ? "VIDEO" : "IMAGE")
    : campaign.mediaType || "IMAGE";

  if (file && file.buffer) {
    isVideoUpload = (file.mimetype && file.mimetype.startsWith("video/")) || targetMediaType === "VIDEO";
    uploaded = await uploadCampaignMedia(file, isVideoUpload);
  }

  const previousPublicId = campaign.cloudinaryPublicId;
  const previousVideoPublicId = campaign.cloudinaryVideoPublicId;

  try {
    if (title !== undefined) campaign.title = title;
    if (clickUrl !== undefined) campaign.clickUrl = clickUrl;
    if (imageAlt !== undefined) campaign.imageAlt = imageAlt;
    if (target !== undefined) campaign.target = target;
    if (priority !== undefined) campaign.priority = priority;
    if (isActive !== undefined) campaign.isActive = isActive;
    if (startDate !== undefined) campaign.startDate = startDate;
    if (endDate !== undefined) campaign.endDate = endDate;
    if (rawMediaType !== undefined) campaign.mediaType = targetMediaType;
    if (rawVideoUrl !== undefined) campaign.videoUrl = String(rawVideoUrl).trim();

    if (uploaded) {
      if (isVideoUpload) {
        campaign.mediaType = "VIDEO";
        campaign.videoUrl = uploaded.secure_url;
        campaign.cloudinaryVideoPublicId = uploaded.public_id;
        campaign.imageUrl = uploaded.secure_url.replace(/\.[^.]+$/, ".jpg");
        campaign.imageWidth = uploaded.width || null;
        campaign.imageHeight = uploaded.height || null;
      } else {
        campaign.mediaType = "IMAGE";
        campaign.imageUrl = uploaded.secure_url;
        campaign.cloudinaryPublicId = uploaded.public_id;
        campaign.videoUrl = "";
        campaign.imageWidth = uploaded.width || null;
        campaign.imageHeight = uploaded.height || null;
      }
    }

    campaign.updatedBy = userId;
    await campaign.save();
  } catch (err) {
    if (uploaded) {
      await destroyAsset(uploaded.public_id, isVideoUpload ? "video" : "image").catch(() => {});
    }
    throw err;
  }

  // Clean up previous assets if new upload succeeded
  if (uploaded) {
    if (isVideoUpload && previousVideoPublicId && previousVideoPublicId !== uploaded.public_id) {
      await destroyAsset(previousVideoPublicId, "video").catch(() => {});
    }
    if (!isVideoUpload && previousPublicId && previousPublicId !== uploaded.public_id) {
      await destroyAsset(previousPublicId, "image").catch(() => {});
    }
  }

  return campaign;
};

// Soft delete: campaigns are deactivated (not destroyed) so historical
// click stats keep pointing at a real campaign record.
const deleteAdCampaign = async (id, userId) => {
  assertValidId(id);
  const campaign = await AdCampaign.findById(id);
  if (!campaign) throw new NotFoundError("Ad campaign not found");

  campaign.isActive = false;
  campaign.updatedBy = userId;
  await campaign.save();
  return { id, isActive: campaign.isActive };
};

module.exports = {
  listAdCampaigns,
  getAdCampaignById,
  createAdCampaign,
  updateAdCampaign,
  deleteAdCampaign,
};
