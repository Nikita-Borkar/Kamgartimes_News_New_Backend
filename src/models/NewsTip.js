const mongoose = require("mongoose");

const newsTipSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    subject: { type: String, trim: true, maxlength: 200 },
    location: { type: String, trim: true, default: "" },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    attachments: [{ type: String }],
    status: { type: String, enum: ["NEW", "IN_REVIEW", "ACCEPTED", "REJECTED", "SPAM"], default: "NEW", index: true },
    notes: { type: String, trim: true, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true },
);

newsTipSchema.index({ status: 1, createdAt: -1 });

const NewsTip = mongoose.model("NewsTip", newsTipSchema);
module.exports = NewsTip;
