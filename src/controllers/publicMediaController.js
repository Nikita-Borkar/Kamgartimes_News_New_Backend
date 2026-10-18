const imageMediaService = require("../services/imageMediaService");
const videoMediaService = require("../services/videoMediaService");
const successResponse = require("../errors/responses/successResponse");

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

module.exports = { listImages, listVideos };
