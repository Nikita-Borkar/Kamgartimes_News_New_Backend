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

const uploadCampaignImage = async (file) => {
  if (!file || !file.buffer) throw new BadRequestError("Campaign image file is required");
  try {
    return await uploadBuffer(file.buffer, { folder: "kamgartimes/ads" });
  } catch (err) {
    throw new BadRequestError(`Cloudinary upload failed: ${err.message}`);
  }
};

const createAdCampaign = async (file, body, userId) => {
  const { title, clickUrl, imageAlt, target, priority, isActive, startDate, endDate } = body;

  assertValidWindow(startDate, endDate);

  const uploaded = await uploadCampaignImage(file);

  try {
    return await AdCampaign.create({
      title,
      clickUrl,
      imageAlt: imageAlt || "",
      target: target || "_blank",
      priority: priority || 0,
      isActive: isActive !== undefined ? isActive : true,
      startDate: startDate || null,
      endDate: endDate || null,
      imageUrl: uploaded.secure_url,
      cloudinaryPublicId: uploaded.public_id,
      imageWidth: uploaded.width || null,
      imageHeight: uploaded.height || null,
      createdBy: userId,
    });
  } catch (err) {
    // Don't leave an orphaned Cloudinary asset if the DB write fails
    await destroyAsset(uploaded.public_id, "image").catch(() => {});
    throw err;
  }
};

const updateAdCampaign = async (id, body, userId, file) => {
  assertValidId(id);
  const campaign = await AdCampaign.findById(id);
  if (!campaign) throw new NotFoundError("Ad campaign not found");

  const { title, clickUrl, imageAlt, target, priority, isActive, startDate, endDate } = body;

  const nextStartsAt = startDate !== undefined ? startDate : campaign.startDate;
  const nextEndsAt = endDate !== undefined ? endDate : campaign.endDate;
  assertValidWindow(nextStartsAt, nextEndsAt);

  let uploaded = null;
  if (file && file.buffer) {
    uploaded = await uploadCampaignImage(file);
  }

  const previousPublicId = campaign.cloudinaryPublicId;

  try {
    if (title !== undefined) campaign.title = title;
    if (clickUrl !== undefined) campaign.clickUrl = clickUrl;
    if (imageAlt !== undefined) campaign.imageAlt = imageAlt;
    if (target !== undefined) campaign.target = target;
    if (priority !== undefined) campaign.priority = priority;
    if (isActive !== undefined) campaign.isActive = isActive;
    if (startDate !== undefined) campaign.startDate = startDate;
    if (endDate !== undefined) campaign.endDate = endDate;

    if (uploaded) {
      campaign.imageUrl = uploaded.secure_url;
      campaign.cloudinaryPublicId = uploaded.public_id;
      campaign.imageWidth = uploaded.width || null;
      campaign.imageHeight = uploaded.height || null;
    }

    campaign.updatedBy = userId;
    await campaign.save();
  } catch (err) {
    if (uploaded) await destroyAsset(uploaded.public_id, "image").catch(() => {});
    throw err;
  }

  // Old asset is only removed once the new one is safely persisted
  if (uploaded && previousPublicId) {
    await destroyAsset(previousPublicId, "image").catch(() => {});
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
