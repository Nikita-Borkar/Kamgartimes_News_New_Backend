const mongoose = require("mongoose");
const SiteSetting = require("../models/SiteSetting");
const { uploadBuffer, destroyAsset } = require("../config/cloudinary");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");

const getSiteSetting = async () => {
  let setting = await SiteSetting.findOne().sort({ createdAt: -1 });

  if (!setting) {
    setting = await SiteSetting.create({
      siteName: "Kamgar Times",
      tagline: "",
      createdBy: null,
      updatedBy: null,
    });
  }

  return setting;
};

const updateSiteSetting = async (body, file, userId) => {
  let setting = await SiteSetting.findOne().sort({ createdAt: -1 });

  if (!setting) {
    setting = await SiteSetting.create({
      siteName: "Kamgar Times",
      tagline: "",
      createdBy: userId,
      updatedBy: userId,
    });
  }

  // Handle logo upload via Cloudinary
  if (file && file.buffer) {
    // Delete old logo from Cloudinary if it exists
    if (setting.logoPublicId) {
      await destroyAsset(setting.logoPublicId, "image").catch(() => {});
    }

    let uploaded;
    try {
      uploaded = await uploadBuffer(file.buffer, {
        folder: "kamgartimes/site-settings",
      });
    } catch (err) {
      throw new BadRequestError(`Cloudinary upload failed: ${err.message}`);
    }

    setting.logoUrl = uploaded.secure_url;
    setting.logoPublicId = uploaded.public_id;
  }

  // Update scalar fields
  const updatableFields = [
    "siteName",
    "tagline",
    "contactEmail",
    "contactPhone",
    "address",
    "isMaintenanceMode",
  ];
  for (const field of updatableFields) {
    if (body[field] !== undefined) {
      setting[field] = body[field];
    }
  }

  // Handle socialLinks array
  if (body.socialLinks !== undefined) {
    setting.socialLinks = body.socialLinks;
  }

  setting.updatedBy = userId;
  await setting.save();

  return setting;
};

module.exports = {
  getSiteSetting,
  updateSiteSetting,
};
