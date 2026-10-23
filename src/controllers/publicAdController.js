const {
  getAdsForSlot,
  recordClick,
  recordImpression,
} = require("../services/publicAdService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const result = await getAdsForSlot(req.validatedQuery.slot);
    return res
      .status(200)
      .json(new successResponse(200, "Ads fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const click = async (req, res, next) => {
  try {
    const result = await recordClick({
      ...req.validatedBody,
      ipAddress: req.ip || "",
      userAgent: req.get("user-agent") || "",
    });
    return res
      .status(200)
      .json(new successResponse(200, "Click recorded", result));
  } catch (err) {
    next(err);
  }
};

const impression = async (req, res, next) => {
  try {
    const result = await recordImpression({
      ...req.validatedBody,
      ipAddress: req.ip || "",
      userAgent: req.get("user-agent") || "",
    });
    return res
      .status(200)
      .json(new successResponse(200, "Impression recorded", result));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, click, impression };
