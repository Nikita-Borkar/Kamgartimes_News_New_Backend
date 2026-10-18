const mongoose = require("mongoose");

// Reader comments. Threading is limited to two levels: replies always point
// at a top-level comment (parent.parent === null), which keeps cascade
// deletes and tree rendering simple.
const commentSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: ["APPROVED", "HIDDEN"],
      default: "APPROVED",
    },
  },
  {
    timestamps: true,
  },
);

commentSchema.index({ article: 1, status: 1, parent: 1, createdAt: 1 });

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
