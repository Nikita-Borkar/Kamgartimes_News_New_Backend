const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
    phone: { type: String, trim: true, maxlength: 30, default: "" },
    subject: { type: String, trim: true, maxlength: 200, default: "" },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    status: { type: String, enum: ["NEW", "IN_REVIEW", "REPLIED", "CLOSED", "SPAM"], default: "NEW", index: true },
    notes: { type: String, trim: true, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true },
);

contactMessageSchema.index({ status: 1, createdAt: -1 });

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);
module.exports = ContactMessage;
