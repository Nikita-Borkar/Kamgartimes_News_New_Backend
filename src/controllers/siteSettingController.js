const { getSiteSetting, updateSiteSetting } = require("../services/siteSettingService");
const successResponse = require("../errors/responses/successResponse");

const get = async (req, res, next) => {
  try {
    const setting = await getSiteSetting();
    return res
      .status(200)
      .json(new successResponse(200, "Site setting fetched successfully", setting));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const setting = await updateSiteSetting(req.validatedBody || {}, req.file, req.user.userId);
    return res
      .status(200)
      .json(new successResponse(200, "Site setting updated successfully", setting));
  } catch (err) {
    next(err);
  }
};

module.exports = { get, update };
