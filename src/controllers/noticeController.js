const {
  listNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  listActiveNotices,
} = require("../services/noticeService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const result = await listNotices(req.validatedQuery || req.query);
    return res
      .status(200)
      .json(new successResponse(200, "Notices fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const notice = await getNoticeById(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Notice fetched successfully", notice));
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const notice = await createNotice(req.validatedBody, req.user.userId);
    return res
      .status(201)
      .json(new successResponse(201, "Notice created successfully", notice));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const notice = await updateNotice(req.params.id, req.validatedBody, req.user.userId);
    return res
      .status(200)
      .json(new successResponse(200, "Notice updated successfully", notice));
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deleteNotice(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Notice deleted successfully", result));
  } catch (err) {
    next(err);
  }
};

const ticker = async (req, res, next) => {
  try {
    const notices = await listActiveNotices(req.validatedQuery || {});
    return res
      .status(200)
      .json(new successResponse(200, "Notice ticker fetched successfully", notices));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, remove, ticker };
