const mongoose = require("mongoose");
const Images = require("../models/ImageMedia");
const { uploadBuffer, destroyAsset } = require("../config/cloudinary");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertValidId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError("Invalid image ID");
};

const listImages = async ({ status, search, page = 1, limit = 20 }) => {
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.title = { $regex: escapeRegex(search), $options: "i" };

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [images, total] = await Promise.all([
    Images.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("createdBy", "name"),
    Images.countDocuments(filter),
  ]);

  return { images, total, page: pageNum, limit: limitNum };
};

const getImageById = async (id) => {
  assertValidId(id);
  const image = await Images.findById(id).populate("createdBy", "name");
  if (!image) throw new NotFoundError("Image not found");
  return image;
};

// Streams the multer buffer to Cloudinary, then persists the returned
// asset metadata (url, dimensions, format, size).
const createImage = async (file, meta, userId) => {
  if (!file || !file.buffer) throw new BadRequestError("Image file is required");

  let uploaded;
  try {
    uploaded = await uploadBuffer(file.buffer, { folder: "kamgartimes/images" });
  } catch (err) {
    throw new BadRequestError(`Cloudinary upload failed: ${err.message}`);
  }

  try {
    return await Images.create({
      title: meta.title,
      description: meta.description || "",
      altText: meta.altText || "",
      status: meta.status || "DRAFT",
      cloudinaryPublicId: uploaded.public_id,
      url: uploaded.secure_url,
      resourceType: uploaded.resource_type || "image",
      width: uploaded.width || null,
      height: uploaded.height || null,
      format: uploaded.format || null,
      bytes: uploaded.bytes || 0,
      createdBy: userId,
    });
  } catch (err) {
    // Don't leave an orphaned Cloudinary asset if the DB write fails
    await destroyAsset(uploaded.public_id, "image").catch(() => {});
    throw err;
  }
};

const updateImage = async (id, meta) => {
  assertValidId(id);
  const image = await Images.findById(id);
  if (!image) throw new NotFoundError("Image not found");

  if (meta.title !== undefined) image.title = meta.title;
  if (meta.description !== undefined) image.description = meta.description;
  if (meta.altText !== undefined) image.altText = meta.altText;
  if (meta.status !== undefined) image.status = meta.status;

  await image.save();
  return image;
};

// Destroys the Cloudinary asset first, then the database record
const deleteImage = async (id) => {
  assertValidId(id);
  const image = await Images.findById(id);
  if (!image) throw new NotFoundError("Image not found");

  await destroyAsset(image.cloudinaryPublicId, image.resourceType || "image");
  await image.deleteOne();

  return { id, deleted: true };
};

module.exports = { listImages, getImageById, createImage, updateImage, deleteImage };
