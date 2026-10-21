const mongoose = require("mongoose");
const AdSlot = require("../models/AdSlot");
const slugify = require("../utils/slugify");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError("Invalid ad slot ID");
};

const listAdSlots = async ({ isActive, section, search, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (section) filter.section = section;
  if (search) {
    filter.$or = [
      { name: { $regex: escapeRegex(search), $options: "i" } },
      { key: { $regex: escapeRegex(search), $options: "i" } },
    ];
  }

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [slots, total] = await Promise.all([
    AdSlot.find(filter)
      .sort({ section: 1, position: 1, createdAt: 1 })
      .skip(skip)
      .limit(limitNum)
      .populate("createdBy", "name"),
    AdSlot.countDocuments(filter),
  ]);

  return { slots, total, page: pageNum, limit: limitNum };
};

const getAdSlotById = async (id) => {
  assertValidId(id);
  const slot = await AdSlot.findById(id).populate("createdBy", "name");
  if (!slot) throw new NotFoundError("Ad slot not found");
  return slot;
};

const createAdSlot = async (body, userId) => {
  const { name, key, section, size, position, isActive, maxAds } = body;

  const finalKey = slugify(key || name);
  if (!finalKey) throw new BadRequestError("Could not generate a key from the name");

  const existing = await AdSlot.findOne({ key: finalKey });
  if (existing) throw new BadRequestError(`Ad slot with key "${finalKey}" already exists`);

  return AdSlot.create({
    name,
    key: finalKey,
    section,
    size: {
      width: size.width,
      height: size.height,
      label: size.label || `${size.width}x${size.height}`,
    },
    position: position || 0,
    isActive: isActive !== undefined ? isActive : true,
    maxAds: maxAds || 1,
    createdBy: userId,
  });
};

const updateAdSlot = async (id, body, userId) => {
  assertValidId(id);
  const slot = await AdSlot.findById(id);
  if (!slot) throw new NotFoundError("Ad slot not found");

  const { name, key, section, size, position, isActive, maxAds } = body;

  if (key !== undefined) {
    const finalKey = slugify(key);
    if (!finalKey) throw new BadRequestError("Could not generate a key from the name");
    const existing = await AdSlot.findOne({ key: finalKey, _id: { $ne: id } });
    if (existing) throw new BadRequestError(`Ad slot with key "${finalKey}" already exists`);
    slot.key = finalKey;
  }

  if (size !== undefined) {
    slot.size = {
      width: size.width,
      height: size.height,
      // Keep the stored label in sync unless the admin supplied a custom one
      label: size.label || `${size.width}x${size.height}`,
    };
  }

  if (name !== undefined) slot.name = name;
  if (section !== undefined) slot.section = section;
  if (position !== undefined) slot.position = position;
  if (isActive !== undefined) slot.isActive = isActive;
  if (maxAds !== undefined) slot.maxAds = maxAds;
  slot.updatedBy = userId;

  await slot.save();
  return slot;
};

// Soft delete so active placements are not orphaned
const deleteAdSlot = async (id, userId) => {
  assertValidId(id);
  const slot = await AdSlot.findById(id);
  if (!slot) throw new NotFoundError("Ad slot not found");

  slot.isActive = false;
  slot.updatedBy = userId;
  await slot.save();
  return { id, isActive: slot.isActive };
};

module.exports = {
  listAdSlots,
  getAdSlotById,
  createAdSlot,
  updateAdSlot,
  deleteAdSlot,
};
