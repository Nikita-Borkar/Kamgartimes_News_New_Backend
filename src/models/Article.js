const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    // Article information
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    summary: {
      type: String,
      required: true,
      maxlength: 500,
    },

    // Main article content [Rich Text Editor Data]
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // Cover image shown on the reader site
    featuredImage: {
      type: String,
      default: "",
    },

    // Article classification
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // Author
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Optional city classification for city pages
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      default: null,
      index: true,
    },

    // Publishing workflow
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT",
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Editorial flags for homepage curation
    isLead: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isTrending: { type: Boolean, default: false, index: true },
    isEditorsPick: { type: Boolean, default: false, index: true },
    isBreaking: { type: Boolean, default: false, index: true },

    // Reader-facing extras
    keyPoints: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    readTime: { type: String, default: "" },

    // Denormalized reader interaction counters. Updated with $inc on each
    // interaction so article reads never need joins/aggregations.
    stats: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      dislikes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
    },

    // SEO metadata
    seo: {
      metaTitle: {
        type: String,
        default: "",
      },

      metaDescription: {
        type: String,
        default: "",
      },

      keywords: {
        type: [String],
        default: [],
      },
    },

    // Audit information
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
  },
);

// Reader site: published feed / homepage listings
articleSchema.index({ status: 1, publishedAt: -1 });
// Reader site: articles within a category
articleSchema.index({ category: 1, publishedAt: -1 });
// Homepage rails
articleSchema.index({ status: 1, isBreaking: 1, publishedAt: -1 });
articleSchema.index({ status: 1, isLead: 1, publishedAt: -1 });
articleSchema.index({ status: 1, isFeatured: 1, publishedAt: -1 });
articleSchema.index({ status: 1, isTrending: 1, publishedAt: -1 });
articleSchema.index({ status: 1, isEditorsPick: 1, publishedAt: -1 });
// City pages
articleSchema.index({ status: 1, city: 1, publishedAt: -1 });
// Tag search
articleSchema.index({ tags: 1 });

const Article = mongoose.model("Article", articleSchema);
module.exports = Article;
