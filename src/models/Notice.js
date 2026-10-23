const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notice title is required"],
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: [true, "Notice message is required"],
      trim: true,
      maxlength: 1000,
    },

    linkUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // Label rendered on the ticker's link button (e.g. "Read More")
    linkText: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "",
    },

    // Notice vs breaking strip
    kind: {
      type: String,
      enum: ["NOTICE", "BREAKING"],
      default: "NOTICE",
      index: true,
    },

    // Higher priority notices appear first in the ticker
    priority: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    startsAt: {
      type: Date,
      default: null,
    },

    endsAt: {
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
  },
);

noticeSchema.index({ isActive: 1, kind: 1, priority: -1, createdAt: -1 });
noticeSchema.index({ isActive: 1, startsAt: 1, endsAt: 1 });

const Notice = mongoose.model("Notice", noticeSchema);

module.exports = Notice;
