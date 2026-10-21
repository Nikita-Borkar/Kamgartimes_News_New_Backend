const mongoose = require("mongoose");

// One row per reader click, used by the admin click report.
const adClickSchema = new mongoose.Schema({
  adCampaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdCampaign",
    required: true,
    index: true,
  },

  adSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdSlot",
    required: true,
    index: true,
  },

  ipAddress: {
    type: String,
    default: "",
  },

  userAgent: {
    type: String,
    default: "",
  },

  clickedAt: {
    type: Date,
    default: Date.now,
  },
});

adClickSchema.index({ adCampaign: 1, clickedAt: -1 });
adClickSchema.index({ adSlot: 1, clickedAt: -1 });

const AdClick = mongoose.model("AdClick", adClickSchema);

module.exports = AdClick;
