const {
  listEditions,
  listPublicEditions,
  getEditionById,
  getPublicEditionBySlug,
  createEdition,
  updateEdition,
  deleteEdition,
} = require("../services/epaperService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const result = await listEditions(req.validatedQuery);
    return res
      .status(200)
      .json(new successResponse(200, "E-paper editions fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const publicList = async (req, res, next) => {
  try {
    const result = await listPublicEditions(req.validatedQuery);
    return res
      .status(200)
      .json(new successResponse(200, "E-paper editions fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const edition = await getEditionById(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "E-paper edition fetched successfully", edition));
  } catch (err) {
    next(err);
  }
};

const getPublicBySlug = async (req, res, next) => {
  try {
    const edition = await getPublicEditionBySlug(req.params.slug);
    return res
      .status(200)
      .json(new successResponse(200, "E-paper edition fetched successfully", edition));
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const edition = await createEdition(req.validatedBody, req.user.userId);
    return res
      .status(201)
      .json(new successResponse(201, "E-paper edition created successfully", edition));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const edition = await updateEdition(
      req.params.id,
      req.validatedBody,
      req.user.userId,
    );
    return res
      .status(200)
      .json(new successResponse(200, "E-paper edition updated successfully", edition));
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deleteEdition(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "E-paper edition deactivated successfully", result));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, publicList, getById, getPublicBySlug, create, update, remove };
