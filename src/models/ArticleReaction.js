const mongoose = require("mongoose");

// One reaction (like/dislike) per user per article.
// The compound unique index makes toggling idempotent under concurrency.
const articleReactionSchema = new mongoose.Schema(
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

    type: {
      type: String,
      enum: ["LIKE", "DISLIKE"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

articleReactionSchema.index({ article: 1, user: 1 }, { unique: true });

const ArticleReaction = mongoose.model("ArticleReaction", articleReactionSchema);
module.exports = ArticleReaction;
