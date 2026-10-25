const {
  listLiveNews,
  getLiveNewsById,
  createLiveNews,
  updateLiveNews,
  deleteLiveNews,
  listActiveLiveNews,
} = require("../services/liveNewsService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const result = await listLiveNews(req.validatedQuery || req.query);
    return res
      .status(200)
      .json(new successResponse(200, "Live news fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const item = await getLiveNewsById(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Live news fetched successfully", item));
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const item = await createLiveNews(req.validatedBody, req.user.userId);
    return res
      .status(201)
      .json(new successResponse(201, "Live news created successfully", item));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const item = await updateLiveNews(
      req.params.id,
      req.validatedBody,
      req.user.userId
    );
    return res
      .status(200)
      .json(new successResponse(200, "Live news updated successfully", item));
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deleteLiveNews(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Live news deleted successfully", result));
  } catch (err) {
    next(err);
  }
};

const ticker = async (req, res, next) => {
  try {
    const items = await listActiveLiveNews(req.validatedQuery || {});
    return res
      .status(200)
      .json(
        new successResponse(
          200,
          "Live news ticker fetched successfully",
          items
        )
      );
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, remove, ticker };