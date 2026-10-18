const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    altText: {
      type: String,
      trim: true,
      default: "",
    },

    youtubeUrl: {
      type: String,
      required: true,
    },

    youtubeVideoID: {
      type: String,
      required: true,
    },

    thumbnailUrl: {
      type: String,
      default: "",
    },

    videoType: {
      type: String,
      enum: ["SHORT", "VIDEO"],
      required: true,
    },

    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: true,
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Canonical YouTube embed URL derived from the stored video ID
videoSchema.virtual("embedUrl").get(function () {
  return `https://www.youtube.com/embed/${this.youtubeVideoID}`;
});

videoSchema.index({ status: 1, createdAt: -1 });

const Videos = mongoose.model("Videos", videoSchema);
module.exports = Videos;
