const mongoose = require("mongoose");

// The advertisement itself: a static image hosted on Cloudinary plus its
// destination URL. Campaigns are scheduled with an optional date window.
const adCampaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Campaign title is required"],
      trim: true,
      maxlength: 200,
    },

    clickUrl: {
      type: String,
      required: [true, "Campaign click URL is required"],
      trim: true,
      maxlength: 500,
    },

    imageUrl: {
      type: String,
      required: [true, "Campaign image is required"],
    },

    imageAlt: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    target: {
      type: String,
      enum: ["_blank", "_self"],
      default: "_blank",
    },

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Higher priority campaigns are served first in a slot
    priority: {
      type: Number,
      default: 0,
    },

    cloudinaryPublicId: {
      type: String,
      default: "",
    },

    imageWidth: {
      type: Number,
      default: null,
    },

    imageHeight: {
      type: Number,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

adCampaignSchema.index({ isActive: 1, priority: -1 });
adCampaignSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

const AdCampaign = mongoose.model("AdCampaign", adCampaignSchema);

module.exports = AdCampaign;
