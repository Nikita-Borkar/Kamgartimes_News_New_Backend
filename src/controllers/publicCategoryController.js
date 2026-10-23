const {
  listPublicCategories,
  getPublicCategoryBySlug,
} = require("../services/publicCategoryService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const result = await listPublicCategories();
    return res
      .status(200)
      .json(new successResponse(200, "Categories fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const getBySlug = async (req, res, next) => {
  try {
    const category = await getPublicCategoryBySlug(req.params.slug);
    return res
      .status(200)
      .json(new successResponse(200, "Category fetched successfully", category));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getBySlug };
