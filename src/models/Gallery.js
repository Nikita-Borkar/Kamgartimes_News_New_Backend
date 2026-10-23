const mongoose = require("mongoose");

const galleryImageSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, default: "" },
    caption: { type: String, trim: true, default: "" },
    altText: { type: String, trim: true, default: "" },
  },
  { _id: true },
);

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true, default: "" },
    coverImage: { type: String, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    images: { type: [galleryImageSchema], default: [] },
    status: { type: String, enum: ["DRAFT", "PUBLISHED"], default: "DRAFT", index: true },
    publishedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

gallerySchema.index({ status: 1, publishedAt: -1 });

const Gallery = mongoose.model("Gallery", gallerySchema);
module.exports = Gallery;
