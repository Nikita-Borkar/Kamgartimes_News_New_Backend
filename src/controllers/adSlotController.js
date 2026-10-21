const {
  listAdSlots,
  getAdSlotById,
  createAdSlot,
  updateAdSlot,
  deleteAdSlot,
} = require("../services/adSlotService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const result = await listAdSlots(req.validatedQuery || req.query);
    return res
      .status(200)
      .json(new successResponse(200, "Ad slots fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const slot = await getAdSlotById(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Ad slot fetched successfully", slot));
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const slot = await createAdSlot(req.validatedBody, req.user.userId);
    return res
      .status(201)
      .json(new successResponse(201, "Ad slot created successfully", slot));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const slot = await updateAdSlot(req.params.id, req.validatedBody, req.user.userId);
    return res
      .status(200)
      .json(new successResponse(200, "Ad slot updated successfully", slot));
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deleteAdSlot(req.params.id, req.user.userId);
    return res
      .status(200)
      .json(new successResponse(200, "Ad slot deactivated successfully", result));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, remove };
