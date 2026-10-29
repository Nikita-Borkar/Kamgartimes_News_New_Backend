const mongoose = require("mongoose");

const staticPageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    excerpt: { type: String, trim: true, maxlength: 500, default: "" },
    isActive: { type: Boolean, default: true },
    showInFooter: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    seo: {
      metaTitle: { type: String, default: "", maxlength: 250 },
      metaDescription: { type: String, default: "", maxlength: 300 },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // nullable: seed scripts and system-created pages have no acting user
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

staticPageSchema.index({ slug: 1, isActive: 1 });
staticPageSchema.index({ isActive: 1, sortOrder: 1 });

const StaticPage = mongoose.model("StaticPage", staticPageSchema);

module.exports = StaticPage;
