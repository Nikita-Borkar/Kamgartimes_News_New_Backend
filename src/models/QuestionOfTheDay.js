const mongoose = require("mongoose");

const qotdSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 500 },
    options: [{ type: String, trim: true }],
    correctAnswer: { type: String, trim: true },
    explanation: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    category: { type: String, trim: true, default: "" },
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
  { timestamps: true },
);

qotdSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

const QuestionOfTheDay = mongoose.model("QuestionOfTheDay", qotdSchema);

module.exports = QuestionOfTheDay;