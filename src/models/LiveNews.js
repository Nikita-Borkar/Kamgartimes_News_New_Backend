const mongoose = require("mongoose");

const liveNewsSchema = new mongoose.Schema(
  {
    // Heading shown on the reader ticker / live-news rail
    heading: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },

    // Label rendered on the link/button (e.g. "Read More")
    linkText: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "Read More",
    },

    // Destination page URL the reader is redirected to on click
    linkUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // Category the live news occurs under (used for redirect page context)
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Higher priority items appear first
    priority: {
      type: Number,
      default: 0,
    },

    // When the item goes live (null = live immediately while active)
    publishedAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

liveNewsSchema.index({ isActive: 1, priority: -1, publishedAt: -1 });

const LiveNews = mongoose.model("LiveNews", liveNewsSchema);
module.exports = LiveNews;