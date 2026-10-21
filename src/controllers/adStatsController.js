const { getClickStats } = require("../services/adStatsService");
const successResponse = require("../errors/responses/successResponse");

const clicks = async (req, res, next) => {
  try {
    const result = await getClickStats(req.validatedQuery || req.query);
    return res
      .status(200)
      .json(new successResponse(200, "Ad click stats fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

module.exports = { clicks };
