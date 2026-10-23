const mongoose = require("mongoose");

const adInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
    phone: { type: String, trim: true, maxlength: 30, default: "" },
    company: { type: String, trim: true, default: "" },
    adType: { type: String, trim: true, default: "" },
    budget: { type: String, trim: true, default: "" },
    preferredSlot: { type: String, trim: true, default: "" },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    message: { type: String, trim: true, maxlength: 4000, default: "" },
    status: { type: String, enum: ["NEW", "IN_REVIEW", "QUOTED", "CLOSED", "REJECTED"], default: "NEW", index: true },
    notes: { type: String, trim: true, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true },
);

adInquirySchema.index({ status: 1, createdAt: -1 });

const AdInquiry = mongoose.model("AdInquiry", adInquirySchema);
module.exports = AdInquiry;
