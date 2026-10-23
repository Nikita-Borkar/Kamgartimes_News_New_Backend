const mongoose = require("mongoose");

const pollOptionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 200 },
    votes: { type: Number, default: 0 },
  },
  { _id: true },
);

const pollSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 500 },
    options: { type: [pollOptionSchema], required: true },
    isActive: { type: Boolean, default: true, index: true },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    totalVotes: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

pollSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

const Poll = mongoose.model("Poll", pollSchema);
module.exports = Poll;
