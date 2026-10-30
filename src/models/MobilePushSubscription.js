const mongoose = require("mongoose");

const mobilePushSubscriptionSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ["android", "ios", "web", "unknown"],
      default: "android",
    },
    deviceName: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastDeliveredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

mobilePushSubscriptionSchema.index({ isActive: 1, updatedAt: -1 });

module.exports = mongoose.model("MobilePushSubscription", mobilePushSubscriptionSchema);
