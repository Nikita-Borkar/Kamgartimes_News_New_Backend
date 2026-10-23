const { getPublicHome } = require("../services/publicHomeService");
const successResponse = require("../errors/responses/successResponse");

const home = async (req, res, next) => {
  try {
    const data = await getPublicHome();
    return res
      .status(200)
      .json(new successResponse(200, "Home feed fetched successfully", data));
  } catch (err) {
    next(err);
  }
};

module.exports = { home };
