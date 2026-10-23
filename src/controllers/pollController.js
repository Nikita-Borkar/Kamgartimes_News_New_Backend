const {
  listPolls,
  getPollById,
  getActivePoll,
  createPoll,
  updatePoll,
  deletePoll,
  votePoll,
} = require("../services/pollService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const result = await listPolls(req.validatedQuery);
    return res
      .status(200)
      .json(new successResponse(200, "Polls fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const poll = await getPollById(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Poll fetched successfully", poll));
  } catch (err) {
    next(err);
  }
};

const active = async (req, res, next) => {
  try {
    const poll = await getActivePoll();
    return res
      .status(200)
      .json(new successResponse(200, "Active poll fetched successfully", poll));
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const poll = await createPoll(req.validatedBody, req.user.userId);
    return res
      .status(201)
      .json(new successResponse(201, "Poll created successfully", poll));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const poll = await updatePoll(req.params.id, req.validatedBody, req.user.userId);
    return res
      .status(200)
      .json(new successResponse(200, "Poll updated successfully", poll));
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deletePoll(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Poll closed successfully", result));
  } catch (err) {
    next(err);
  }
};

const vote = async (req, res, next) => {
  try {
    const poll = await votePoll(req.params.id, {
      optionId: req.validatedBody.optionId,
      userId: req.user?.userId || null,
      ipAddress: req.ip || "",
      userAgent: req.get("user-agent") || "",
    });
    return res
      .status(200)
      .json(new successResponse(200, "Vote recorded successfully", poll));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, active, create, update, remove, vote };
