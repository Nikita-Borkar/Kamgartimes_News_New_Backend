const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    cloudinaryPublicId: {
      type: String,
      required: true,
      unique: true,
    },

    altText: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT",
    },

    width: {
      type: Number,
      default: null,
    },

    height: {
      type: Number,
      default: null,
    },

    format: {
      type: String,
      default: null,
    },

    // Renderable asset info (filled from the Cloudinary upload response)
    url: {
      type: String,
      required: true,
    },

    resourceType: {
      type: String,
      default: "image",
    },

    bytes: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

imageSchema.index({ status: 1, createdAt: -1 });

const Images = mongoose.model("Images", imageSchema);
module.exports = Images;
