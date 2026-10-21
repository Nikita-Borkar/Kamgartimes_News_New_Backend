const mongoose = require("mongoose");

// A fixed position on the reader site (hero, sidebar, footer, ...) that can
// hold up to `maxAds` active campaigns at a time. The frontend addresses a
// position by `key` (e.g. ?slot=hero_leaderboard).
const adSlotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Slot name is required"],
      trim: true,
      maxlength: 100,
    },

    key: {
      type: String,
      required: [true, "Slot key is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    section: {
      type: String,
      required: [true, "Slot section is required"],
      trim: true,
      maxlength: 50,
    },

    size: {
      width: {
        type: Number,
        required: [true, "Slot width is required"],
        min: 1,
      },
      height: {
        type: Number,
        required: [true, "Slot height is required"],
        min: 1,
      },
      label: {
        type: String,
        default: "",
      },
    },

    position: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    maxAds: {
      type: Number,
      default: 1,
      min: 1,
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

adSlotSchema.index({ isActive: 1, section: 1, position: 1 });

const AdSlot = mongoose.model("AdSlot", adSlotSchema);

module.exports = AdSlot;
