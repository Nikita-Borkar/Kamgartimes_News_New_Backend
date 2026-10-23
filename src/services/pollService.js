const mongoose = require("mongoose");
const Poll = require("../models/Poll");
const PollVote = require("../models/PollVote");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");

const assertValidId = (id, label = "poll") => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError(`Invalid ${label} ID`);
};

const activeWindow = (now) => ({
  $and: [
    { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
    { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
  ],
});

const toPublicPoll = (poll) => {
  if (!poll) return null;
  const totalVotes = poll.totalVotes || 0;
  return {
    _id: poll._id,
    question: poll.question,
    totalVotes,
    startDate: poll.startDate,
    endDate: poll.endDate,
    options: (poll.options || []).map((option) => ({
      _id: option._id,
      text: option.text,
      votes: option.votes || 0,
      percentage: totalVotes
        ? Math.round(((option.votes || 0) / totalVotes) * 1000) / 10
        : 0,
    })),
  };
};

const listPolls = async ({ isActive, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true" || isActive === true;

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

  const [polls, total] = await Promise.all([
    Poll.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("createdBy", "name"),
    Poll.countDocuments(filter),
  ]);

  return { polls, total, page: pageNum, limit: limitNum };
};

const getPollById = async (id) => {
  assertValidId(id);
  const poll = await Poll.findById(id).populate("createdBy", "name");
  if (!poll) throw new NotFoundError("Poll not found");
  return poll;
};

const getActivePoll = async () => {
  const poll = await Poll.findOne({ isActive: true, ...activeWindow(new Date()) })
    .sort({ createdAt: -1 })
    .lean();
  return poll ? toPublicPoll(poll) : null;
};

const createPoll = async (body, userId) => {
  const poll = await Poll.create({
    question: body.question,
    options: body.options.map((option) => ({ text: option.text, votes: 0 })),
    isActive: body.isActive !== undefined ? body.isActive : true,
    startDate: body.startDate || null,
    endDate: body.endDate || null,
    createdBy: userId,
    updatedBy: null,
  });
  return poll;
};

const updatePoll = async (id, body, userId) => {
  assertValidId(id);
  const poll = await Poll.findById(id);
  if (!poll) throw new NotFoundError("Poll not found");

  if (body.question !== undefined) poll.question = body.question;
  if (body.isActive !== undefined) poll.isActive = body.isActive;
  if (body.startDate !== undefined) poll.startDate = body.startDate;
  if (body.endDate !== undefined) poll.endDate = body.endDate;

  if (body.options !== undefined) {
    const nextTexts = body.options.map((option) => option.text);
    const currentTexts = poll.options.map((option) => option.text);

    if (poll.totalVotes > 0) {
      const sameSet =
        nextTexts.length === currentTexts.length &&
        nextTexts.every((text) => currentTexts.includes(text));
      if (!sameSet) {
        throw new BadRequestError(
          "Cannot add, remove or rename options after votes have been cast",
        );
      }
      // Keep the existing option documents (and their votes) untouched.
      for (const option of poll.options) {
        const next = body.options.find((candidate) => candidate.text === option.text);
        if (next) option.text = next.text;
      }
    } else {
      poll.options = nextTexts.map((text) => ({ text, votes: 0 }));
    }
  }

  poll.updatedBy = userId;
  await poll.save();
  return poll;
};

const deletePoll = async (id) => {
  assertValidId(id);
  const poll = await Poll.findById(id);
  if (!poll) throw new NotFoundError("Poll not found");

  poll.isActive = false;
  await poll.save();
  return { id, isActive: poll.isActive };
};

const votePoll = async (id, { optionId, userId = null, ipAddress = "", userAgent = "" }) => {
  assertValidId(id);
  assertValidId(optionId, "option");

  const poll = await Poll.findOne({ _id: id, isActive: true, ...activeWindow(new Date()) });
  if (!poll) throw new NotFoundError("Poll is not active");

  const option = poll.options.id(optionId);
  if (!option) throw new BadRequestError("Option not found in this poll");

  const identity = userId
    ? { poll: poll._id, user: userId }
    : { poll: poll._id, ipAddress, userAgent, user: null };

  const existing = await PollVote.findOne(identity);
  if (existing) throw new BadRequestError("You have already voted in this poll");

  try {
    await PollVote.create({
      poll: poll._id,
      option: option._id,
      user: userId,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new BadRequestError("You have already voted in this poll");
    }
    throw err;
  }

  const updated = await Poll.findOneAndUpdate(
    { _id: poll._id, "options._id": option._id },
    { $inc: { "options.$.votes": 1, totalVotes: 1 } },
    { new: true },
  ).lean();

  return toPublicPoll(updated);
};

module.exports = {
  listPolls,
  getPollById,
  getActivePoll,
  createPoll,
  updatePoll,
  deletePoll,
  votePoll,
  toPublicPoll,
};
