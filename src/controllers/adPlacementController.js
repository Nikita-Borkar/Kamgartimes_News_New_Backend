const {
  listAdPlacements,
  getAdPlacementById,
  createAdPlacement,
  updateAdPlacement,
  deleteAdPlacement,
} = require("../services/adPlacementService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const result = await listAdPlacements(req.validatedQuery || req.query);
    return res
      .status(200)
      .json(new successResponse(200, "Ad placements fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const placement = await getAdPlacementById(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Ad placement fetched successfully", placement));
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const placement = await createAdPlacement(req.validatedBody, req.user.userId);
    return res
      .status(201)
      .json(new successResponse(201, "Ad placement created successfully", placement));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const placement = await updateAdPlacement(
      req.params.id,
      req.validatedBody,
      req.user.userId,
    );
    return res
      .status(200)
      .json(new successResponse(200, "Ad placement updated successfully", placement));
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deleteAdPlacement(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Ad placement deleted successfully", result));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, remove };
