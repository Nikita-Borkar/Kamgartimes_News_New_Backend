const {
  listGalleries,
  listPublicGalleries,
  getGalleryById,
  getPublicGalleryBySlug,
  createGallery,
  updateGallery,
  deleteGallery,
} = require("../services/galleryService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const result = await listGalleries(req.validatedQuery);
    return res
      .status(200)
      .json(new successResponse(200, "Galleries fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const publicList = async (req, res, next) => {
  try {
    const result = await listPublicGalleries(req.validatedQuery);
    return res
      .status(200)
      .json(new successResponse(200, "Galleries fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const gallery = await getGalleryById(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Gallery fetched successfully", gallery));
  } catch (err) {
    next(err);
  }
};

const getPublicBySlug = async (req, res, next) => {
  try {
    const gallery = await getPublicGalleryBySlug(req.params.slug);
    return res
      .status(200)
      .json(new successResponse(200, "Gallery fetched successfully", gallery));
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const gallery = await createGallery(req.validatedBody, req.user.userId);
    return res
      .status(201)
      .json(new successResponse(201, "Gallery created successfully", gallery));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const gallery = await updateGallery(
      req.params.id,
      req.validatedBody,
      req.user.userId,
    );
    return res
      .status(200)
      .json(new successResponse(200, "Gallery updated successfully", gallery));
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deleteGallery(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Gallery deleted successfully", result));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, publicList, getById, getPublicBySlug, create, update, remove };
