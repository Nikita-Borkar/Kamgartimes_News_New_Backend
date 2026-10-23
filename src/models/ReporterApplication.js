const mongoose = require("mongoose");

const reporterApplicationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 150 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    city: { type: String, trim: true, default: "" },
    experience: { type: String, trim: true, default: "" },
    portfolioUrl: { type: String, trim: true, default: "" },
    coverLetter: { type: String, trim: true, maxlength: 4000, default: "" },
    status: { type: String, enum: ["NEW", "IN_REVIEW", "SHORTLISTED", "REJECTED", "HIRED"], default: "NEW", index: true },
    notes: { type: String, trim: true, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true },
);

reporterApplicationSchema.index({ status: 1, createdAt: -1 });

const ReporterApplication = mongoose.model("ReporterApplication", reporterApplicationSchema);
module.exports = ReporterApplication;
