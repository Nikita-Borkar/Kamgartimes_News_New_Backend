const {
  listImages,
  getImageById,
  createImage,
  updateImage,
  deleteImage,
} = require("../services/imageMediaService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const result = await listImages(req.query);
    return res
      .status(200)
      .json(new successResponse(200, "Images fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const image = await getImageById(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Image fetched successfully", image));
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const image = await createImage(req.file, req.validatedBody, req.user.userId);
    return res
      .status(201)
      .json(new successResponse(201, "Image uploaded successfully", image));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const image = await updateImage(req.params.id, req.validatedBody);
    return res
      .status(200)
      .json(new successResponse(200, "Image updated successfully", image));
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deleteImage(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Image deleted successfully", result));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, remove };
