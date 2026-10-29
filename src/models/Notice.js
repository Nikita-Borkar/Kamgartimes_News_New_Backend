const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
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

    // Notice vs breaking strip
    kind: {
      type: String,
      enum: ["NOTICE", "BREAKING"],
      default: "NOTICE",
      index: true,
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

noticeSchema.index({ isActive: 1, kind: 1, createdAt: -1 });
noticeSchema.index({ isActive: 1, startsAt: 1, endsAt: 1 });

const Notice = mongoose.model("Notice", noticeSchema);

module.exports = Notice;
