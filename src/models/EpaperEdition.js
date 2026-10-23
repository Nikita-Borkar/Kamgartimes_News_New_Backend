const mongoose = require("mongoose");

const epaperEditionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    editionDate: { type: Date, required: true, index: true },
    city: { type: mongoose.Schema.Types.ObjectId, ref: "City", default: null },
    pdfUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, default: "" },
    coverImageUrl: { type: String, default: "" },
    pageCount: { type: Number, default: null },
    fileSize: { type: String, default: "" },
    blurb: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

epaperEditionSchema.index({ isActive: 1, editionDate: -1 });

const EpaperEdition = mongoose.model("EpaperEdition", epaperEditionSchema);
module.exports = EpaperEdition;
