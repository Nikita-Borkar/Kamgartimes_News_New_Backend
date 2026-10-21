const {
  listStaticPages,
  getStaticPageById,
  createStaticPage,
  updateStaticPage,
  deleteStaticPage,
  getPublicStaticPageBySlug,
} = require("../services/staticPageService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const result = await listStaticPages(req.validatedQuery || req.query);
    return res
      .status(200)
      .json(new successResponse(200, "Static pages fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const page = await getStaticPageById(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Static page fetched successfully", page));
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const page = await createStaticPage(req.validatedBody, req.user.userId);
    return res
      .status(201)
      .json(new successResponse(201, "Static page created successfully", page));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const page = await updateStaticPage(req.params.id, req.validatedBody, req.user.userId);
    return res
      .status(200)
      .json(new successResponse(200, "Static page updated successfully", page));
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deleteStaticPage(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Static page deactivated successfully", result));
  } catch (err) {
    next(err);
  }
};

const getPublicBySlug = async (req, res, next) => {
  try {
    const page = await getPublicStaticPageBySlug(req.params.slug);
    return res
      .status(200)
      .json(new successResponse(200, "Static page fetched successfully", page));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  getPublicBySlug,
};
