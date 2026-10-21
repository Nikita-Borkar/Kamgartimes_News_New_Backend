const {
  listAdCampaigns,
  getAdCampaignById,
  createAdCampaign,
  updateAdCampaign,
  deleteAdCampaign,
} = require("../services/adCampaignService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const result = await listAdCampaigns(req.validatedQuery || req.query);
    return res
      .status(200)
      .json(new successResponse(200, "Ad campaigns fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const campaign = await getAdCampaignById(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Ad campaign fetched successfully", campaign));
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const campaign = await createAdCampaign(req.file, req.validatedBody, req.user.userId);
    return res
      .status(201)
      .json(new successResponse(201, "Ad campaign created successfully", campaign));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const campaign = await updateAdCampaign(
      req.params.id,
      req.validatedBody,
      req.user.userId,
      req.file,
    );
    return res
      .status(200)
      .json(new successResponse(200, "Ad campaign updated successfully", campaign));
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deleteAdCampaign(req.params.id, req.user.userId);
    return res
      .status(200)
      .json(new successResponse(200, "Ad campaign deactivated successfully", result));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, remove };
