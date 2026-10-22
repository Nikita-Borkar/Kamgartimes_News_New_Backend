const mongoose = require("mongoose");
const QuestionOfTheDay = require("../models/QuestionOfTheDay");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const listQuestionOfTheDay = async ({
  isActive,
  category,
  page = 1,
  limit = 20,
} = {}) => {
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (category) filter.category = { $regex: escapeRegex(category), $options: "i" };

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [questions, total] = await Promise.all([
    QuestionOfTheDay.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("createdBy", "name")
      .populate("updatedBy", "name"),
    QuestionOfTheDay.countDocuments(filter),
  ]);

  return { questions, total, page: pageNum, limit: limitNum };
};

const getQuestionOfTheDayById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new BadRequestError("Invalid question ID");
  }
  const question = await QuestionOfTheDay.findById(id)
    .populate("createdBy", "name")
    .populate("updatedBy", "name");
  if (!question) throw new NotFoundError("Question not found");
  return question;
};

const createQuestionOfTheDay = async (body, userId) => {
  const question = await QuestionOfTheDay.create({
    ...body,
    createdBy: userId,
    updatedBy: userId,
  });
  return question;
};

const updateQuestionOfTheDay = async (id, body, userId) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new BadRequestError("Invalid question ID");
  }
  const question = await QuestionOfTheDay.findById(id);
  if (!question) throw new NotFoundError("Question not found");

  const updatableFields = [
    "question",
    "options",
    "correctAnswer",
    "explanation",
    "isActive",
    "startDate",
    "endDate",
    "category",
  ];
  for (const field of updatableFields) {
    if (body[field] !== undefined) {
      question[field] = body[field];
    }
  }
  question.updatedBy = userId;
  await question.save();

  return question;
};

const deleteQuestionOfTheDay = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new BadRequestError("Invalid question ID");
  }
  const question = await QuestionOfTheDay.findById(id);
  if (!question) throw new NotFoundError("Question not found");

  question.isActive = false;
  await question.save();
  return { id, isActive: question.isActive };
};

// Public: get today's active question.
// The correct answer and its explanation are intentionally withheld so the
// reader site cannot spoil the question — use checkTodayAnswer() to verify
// what a reader picked.
const getTodayQuestionOfTheDay = async ({ category } = {}) => {
  const now = new Date();

  const filter = {
    isActive: true,
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
    ],
  };

  if (category) filter.category = category;

  const question = await QuestionOfTheDay.findOne(filter)
    .sort({ createdAt: -1 })
    .select("-correctAnswer -explanation")
    .lean();

  if (!question) throw new NotFoundError("No active question of the day found");
  return question;
};

// Public: verify the answer a reader selected for today's question.
const checkTodayAnswer = async ({ answer, category } = {}) => {
  const now = new Date();

  const filter = {
    isActive: true,
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
    ],
  };

  if (category) filter.category = category;

  const question = await QuestionOfTheDay.findOne(filter).sort({ createdAt: -1 }).lean();
  if (!question) throw new NotFoundError("No active question of the day found");

  const isCorrect =
    typeof answer === "string" &&
    answer.trim().toLowerCase() === String(question.correctAnswer || "").trim().toLowerCase();

  return {
    id: question._id,
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation || "",
  };
};

module.exports = {
  listQuestionOfTheDay,
  getQuestionOfTheDayById,
  createQuestionOfTheDay,
  updateQuestionOfTheDay,
  deleteQuestionOfTheDay,
  getTodayQuestionOfTheDay,
  checkTodayAnswer,
};
