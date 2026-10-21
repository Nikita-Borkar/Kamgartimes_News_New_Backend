const mongoose = require("mongoose");
const AdPlacement = require("../models/AdPlacement");
const AdSlot = require("../models/AdSlot");
const AdCampaign = require("../models/AdCampaign");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");

const assertValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError("Invalid ad placement ID");
};

const assertValidWindow = (startDate, endDate) => {
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new BadRequestError("endDate must be after startDate");
  }
};

const assertRefs = async (adSlot, adCampaign) => {
  if (adSlot) {
    const slot = await AdSlot.findById(adSlot);
    if (!slot) throw new BadRequestError("Ad slot not found");
  }
  if (adCampaign) {
    const campaign = await AdCampaign.findById(adCampaign);
    if (!campaign) throw new BadRequestError("Ad campaign not found");
  }
};

const listAdPlacements = async ({ adSlot, adCampaign, isActive, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (adSlot) filter.adSlot = adSlot;
  if (adCampaign) filter.adCampaign = adCampaign;
  if (isActive !== undefined) filter.isActive = isActive === "true";

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [placements, total] = await Promise.all([
    AdPlacement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("adSlot", "name key section size")
      .populate("adCampaign", "title imageUrl priority isActive")
      .populate("createdBy", "name"),
    AdPlacement.countDocuments(filter),
  ]);

  return { placements, total, page: pageNum, limit: limitNum };
};

const getAdPlacementById = async (id) => {
  assertValidId(id);
  const placement = await AdPlacement.findById(id)
    .populate("adSlot", "name key section size")
    .populate("adCampaign", "title imageUrl priority isActive")
    .populate("createdBy", "name");
  if (!placement) throw new NotFoundError("Ad placement not found");
  return placement;
};

const createAdPlacement = async (body, userId) => {
  const { adSlot, adCampaign, startDate, endDate, isActive, weight } = body;

  assertValidWindow(startDate, endDate);
  await assertRefs(adSlot, adCampaign);

  return AdPlacement.create({
    adSlot,
    adCampaign,
    startDate: startDate || null,
    endDate: endDate || null,
    isActive: isActive !== undefined ? isActive : true,
    weight: weight || 1,
    createdBy: userId,
  });
};

const updateAdPlacement = async (id, body, userId) => {
  assertValidId(id);
  const placement = await AdPlacement.findById(id);
  if (!placement) throw new NotFoundError("Ad placement not found");

  const { adSlot, adCampaign, startDate, endDate, isActive, weight } = body;

  const nextStartDate = startDate !== undefined ? startDate : placement.startDate;
  const nextEndDate = endDate !== undefined ? endDate : placement.endDate;
  assertValidWindow(nextStartDate, nextEndDate);
  await assertRefs(adSlot, adCampaign);

  if (adSlot !== undefined) placement.adSlot = adSlot;
  if (adCampaign !== undefined) placement.adCampaign = adCampaign;
  if (startDate !== undefined) placement.startDate = startDate;
  if (endDate !== undefined) placement.endDate = endDate;
  if (isActive !== undefined) placement.isActive = isActive;
  if (weight !== undefined) placement.weight = weight;
  placement.updatedBy = userId;

  await placement.save();
  return placement;
};

const deleteAdPlacement = async (id) => {
  assertValidId(id);
  const placement = await AdPlacement.findById(id);
  if (!placement) throw new NotFoundError("Ad placement not found");

  await placement.deleteOne();
  return { id };
};

module.exports = {
  listAdPlacements,
  getAdPlacementById,
  createAdPlacement,
  updateAdPlacement,
  deleteAdPlacement,
};
