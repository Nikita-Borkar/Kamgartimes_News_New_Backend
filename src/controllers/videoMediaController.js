const {
  listVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
} = require("../services/videoMediaService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const result = await listVideos(req.validatedQuery || req.query);
    return res
      .status(200)
      .json(new successResponse(200, "Videos fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const video = await getVideoById(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Video fetched successfully", video));
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const video = await createVideo(req.validatedBody, req.user.userId);
    return res
      .status(201)
      .json(new successResponse(201, "Video created successfully", video));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const video = await updateVideo(req.params.id, req.validatedBody);
    return res
      .status(200)
      .json(new successResponse(200, "Video updated successfully", video));
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deleteVideo(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Video deleted successfully", result));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, remove };
