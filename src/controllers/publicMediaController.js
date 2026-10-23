const imageMediaService = require("../services/imageMediaService");
const videoMediaService = require("../services/videoMediaService");
const NotFoundError = require("../errors/customErrors/NotFoundError");
const successResponse = require("../errors/responses/successResponse");

const assertPublished = (item, label) => {
  if (!item || item.status !== "PUBLISHED") {
    throw new NotFoundError(`${label} not found`);
  }
  return item;
};

// Public reader surface: only PUBLISHED media is ever visible, regardless
// of what status the query string asks for.
const listImages = async (req, res, next) => {
  try {
    const result = await imageMediaService.listImages({
      ...req.query,
      status: "PUBLISHED",
    });
    return res
      .status(200)
      .json(new successResponse(200, "Images fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const listVideos = async (req, res, next) => {
  try {
    const result = await videoMediaService.listVideos({
      ...req.query,
      status: "PUBLISHED",
    });
    return res
      .status(200)
      .json(new successResponse(200, "Videos fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const getImageById = async (req, res, next) => {
  try {
    const image = await imageMediaService.getImageById(req.params.id);
    return res
      .status(200)
      .json(
        new successResponse(200, "Image fetched successfully", assertPublished(image, "Image")),
      );
  } catch (err) {
    next(err);
  }
};

const getVideoById = async (req, res, next) => {
  try {
    const video = await videoMediaService.getVideoById(req.params.id);
    return res
      .status(200)
      .json(
        new successResponse(200, "Video fetched successfully", assertPublished(video, "Video")),
      );
  } catch (err) {
    next(err);
  }
};

module.exports = { listImages, listVideos, getImageById, getVideoById };
