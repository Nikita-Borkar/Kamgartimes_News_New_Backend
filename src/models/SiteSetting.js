const mongoose = require("mongoose");

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ["youtube", "facebook", "instagram", "whatsapp", "twitter"],
    },
    url: { type: String, required: true, trim: true },
    icon: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const siteSettingSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      trim: true,
      default: "Kamgar Times",
      maxlength: 100,
    },
    tagline: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },
    logoUrl: { type: String, trim: true, default: "" },
    logoPublicId: { type: String, trim: true, default: "" },
    socialLinks: {
      type: [socialLinkSchema],
      default: [],
    },
    contactEmail: { type: String, trim: true, default: "" },
    contactPhone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    isMaintenanceMode: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // nullable: the settings doc is auto-created by GET /site-setting before
      // any user action, so there is no userId to attribute at that point
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

const SiteSetting = mongoose.model("SiteSetting", siteSettingSchema);

module.exports = SiteSetting;