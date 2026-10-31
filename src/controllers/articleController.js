const {
  listArticles,
  getArticleById,
  createArticle,
  updateArticle,
  updateArticleFlags,
  updateArticleStatus,
  deleteArticle,
  moderateComment,
  listCommentsForModeration,
  deleteComment,
  uploadArticlePdf: uploadPdfAsset,
} = require("../services/articleService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const result = await listArticles(req.validatedQuery);
    return res
      .status(200)
      .json(new successResponse(200, "Articles fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const article = await getArticleById(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Article fetched successfully", article));
  } catch (err) {
    next(err);
  }
};

const uploadPdf = async (req, res, next) => {
  try {
    const asset = await uploadPdfAsset(req.file);
    return res
      .status(201)
      .json(new successResponse(201, "Article PDF uploaded successfully", asset));
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const article = await createArticle(req.validatedBody, req.user.userId);
    return res
      .status(201)
      .json(new successResponse(201, "Article created successfully", article));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const article = await updateArticle(req.params.id, req.validatedBody, req.user.userId);
    return res
      .status(200)
      .json(new successResponse(200, "Article updated successfully", article));
  } catch (err) {
    next(err);
  }
};

const updateFlags = async (req, res, next) => {
  try {
    const result = await updateArticleFlags(
      req.params.id,
      req.validatedBody,
      req.user.userId,
    );
    return res
      .status(200)
      .json(new successResponse(200, "Article flags updated successfully", result));
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const result = await updateArticleStatus(
      req.params.id,
      req.validatedBody.status,
      req.user.userId,
    );
    return res
      .status(200)
      .json(new successResponse(200, "Article status updated successfully", result));
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deleteArticle(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Article deleted successfully", result));
  } catch (err) {
    next(err);
  }
};

const moderateCommentStatus = async (req, res, next) => {
  try {
    const result = await moderateComment(req.params.commentId, req.validatedBody.status);
    return res
      .status(200)
      .json(new successResponse(200, "Comment status updated successfully", result));
  } catch (err) {
    next(err);
  }
};

const listForModeration = async (req, res, next) => {
  try {
    const result = await listCommentsForModeration(req.validatedQuery);
    return res
      .status(200)
      .json(new successResponse(200, "Comments fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const removeComment = async (req, res, next) => {
  try {
    const result = await deleteComment(req.params.commentId);
    return res
      .status(200)
      .json(new successResponse(200, "Comment deleted successfully", result));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  getById,
  uploadPdf,
  create,
  update,
  updateFlags,
  updateStatus,
  remove,
  moderateCommentStatus,
  listForModeration,
  removeComment,
};
