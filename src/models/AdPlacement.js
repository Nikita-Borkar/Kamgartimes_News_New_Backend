const mongoose = require("mongoose");

// Assigns a campaign to a slot for a flight window. `weight` (1-100) drives
// weighted rotation between campaigns of equal priority.
const adPlacementSchema = new mongoose.Schema(
  {
    adSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdSlot",
      required: [true, "Ad slot is required"],
      index: true,
    },

    adCampaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdCampaign",
      required: [true, "Ad campaign is required"],
      index: true,
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

    weight: {
      type: Number,
      default: 1,
      min: 1,
      max: 100,
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

adPlacementSchema.index({ adSlot: 1, isActive: 1 });

const AdPlacement = mongoose.model("AdPlacement", adPlacementSchema);

module.exports = AdPlacement;
