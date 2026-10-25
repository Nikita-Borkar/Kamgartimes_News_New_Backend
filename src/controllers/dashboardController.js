const { getDashboardOverview } = require("../services/dashboardService");
const successResponse = require("../errors/responses/successResponse");

const overview = async (req, res, next) => {
  try {
    const result = await getDashboardOverview(req.validatedQuery || {});
    return res
      .status(200)
      .json(new successResponse(200, "Dashboard overview fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

module.exports = { overview };
