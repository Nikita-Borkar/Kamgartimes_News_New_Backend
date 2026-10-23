const mongoose = require("mongoose");

const adImpressionSchema = new mongoose.Schema(
  {
    adCampaign: { type: mongoose.Schema.Types.ObjectId, ref: "AdCampaign", required: true, index: true },
    adSlot: { type: mongoose.Schema.Types.ObjectId, ref: "AdSlot", required: true, index: true },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

adImpressionSchema.index({ adCampaign: 1, createdAt: -1 });
adImpressionSchema.index({ adSlot: 1, createdAt: -1 });

const AdImpression = mongoose.model("AdImpression", adImpressionSchema);
module.exports = AdImpression;
