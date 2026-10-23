const mongoose = require("mongoose");

const pollVoteSchema = new mongoose.Schema(
  {
    poll: { type: mongoose.Schema.Types.ObjectId, ref: "Poll", required: true, index: true },
    option: { type: mongoose.Schema.Types.ObjectId, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

pollVoteSchema.index({ poll: 1, user: 1 }, { unique: true, partialFilterExpression: { user: { $type: "objectId" } } });
pollVoteSchema.index({ poll: 1, ipAddress: 1 });

const PollVote = mongoose.model("PollVote", pollVoteSchema);
module.exports = PollVote;
