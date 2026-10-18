const {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubCategories,
  getCategoryTree,
} = require("../services/categoryService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const result = await listCategories(req.query);
    return res
      .status(200)
      .json(new successResponse(200, "Categories fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const tree = async (req, res, next) => {
  try {
    const result = await getCategoryTree();
    return res
      .status(200)
      .json(new successResponse(200, "Category tree fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const subCategories = async (req, res, next) => {
  try {
    const result = await getSubCategories(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Subcategories fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const category = await getCategoryById(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Category fetched successfully", category));
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const category = await createCategory(req.validatedBody);
    return res
      .status(201)
      .json(new successResponse(201, "Category created successfully", category));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const category = await updateCategory(req.params.id, req.validatedBody);
    return res
      .status(200)
      .json(new successResponse(200, "Category updated successfully", category));
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deleteCategory(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Category deactivated successfully", result));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, tree, subCategories, getById, create, update, remove };