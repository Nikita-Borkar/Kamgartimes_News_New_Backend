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

  // New uploads are theme-specific. Requests without logoVariant are treated
  // as light-logo uploads for compatibility with existing Admin clients.
  if (file && file.buffer) {
    let uploaded;
    try {
      uploaded = await uploadBuffer(file.buffer, {
        folder: "kamgartimes/site-settings",
      });
    } catch (err) {
      throw new BadRequestError(`Cloudinary upload failed: ${err.message}`);
    }

    const variant = String(body.logoVariant || "light").toLowerCase();
    let previousPublicId = null;

    if (variant === "text-dark" || variant === "textdark") {
      previousPublicId = setting.textLogoDarkPublicId;
      setting.textLogoDarkUrl = uploaded.secure_url;
      setting.textLogoDarkPublicId = uploaded.public_id;
    } else if (variant === "text-light" || variant === "textlight") {
      previousPublicId = setting.textLogoLightPublicId;
      setting.textLogoLightUrl = uploaded.secure_url;
      setting.textLogoLightPublicId = uploaded.public_id;
    } else if (variant === "dark") {
      previousPublicId = setting.logoDarkPublicId;
      setting.logoDarkUrl = uploaded.secure_url;
      setting.logoDarkPublicId = uploaded.public_id;
    } else {
      previousPublicId = setting.logoLightPublicId || setting.logoPublicId;
      setting.logoLightUrl = uploaded.secure_url;
      setting.logoLightPublicId = uploaded.public_id;
      // Keep legacy clients and the favicon on the light-theme asset.
      setting.logoUrl = uploaded.secure_url;
      setting.logoPublicId = uploaded.public_id;
    }

    if (previousPublicId && previousPublicId !== uploaded.public_id) {
      await destroyAsset(previousPublicId, "image").catch(() => {});
    }
  }

  // Update scalar fields
  const updatableFields = [
    "siteName",
    "tagline",
    "contactEmail",
    "contactPhone",
    "address",
    "isMaintenanceMode",
    "textLogoLightUrl",
    "textLogoDarkUrl",
    "logoLightUrl",
    "logoDarkUrl",
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
