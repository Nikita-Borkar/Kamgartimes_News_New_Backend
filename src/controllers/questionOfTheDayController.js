const {
  listQuestionOfTheDay,
  getQuestionOfTheDayById,
  createQuestionOfTheDay,
  updateQuestionOfTheDay,
  deleteQuestionOfTheDay,
  getTodayQuestionOfTheDay,
} = require("../services/questionOfTheDayService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const result = await listQuestionOfTheDay(req.validatedQuery || req.query);
    return res
      .status(200)
      .json(
        new successResponse(200, "Question of the day fetched successfully", result),
      );
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const question = await getQuestionOfTheDayById(req.params.id);
    return res
      .status(200)
      .json(
        new successResponse(200, "Question of the day fetched successfully", question),
      );
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const question = await createQuestionOfTheDay(req.validatedBody, req.user.userId);
    return res
      .status(201)
      .json(
        new successResponse(201, "Question of the day created successfully", question),
      );
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const question = await updateQuestionOfTheDay(
      req.params.id,
      req.validatedBody,
      req.user.userId,
    );
    return res
      .status(200)
      .json(
        new successResponse(200, "Question of the day updated successfully", question),
      );
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deleteQuestionOfTheDay(req.params.id);
    return res
      .status(200)
      .json(
        new successResponse(200, "Question of the day deactivated successfully", result),
      );
  } catch (err) {
    next(err);
  }
};

const today = async (req, res, next) => {
  try {
    const question = await getTodayQuestionOfTheDay(req.validatedQuery || {});
    return res
      .status(200)
      .json(
        new successResponse(
          200,
          "Today's question of the day fetched successfully",
          question,
        ),
      );
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
  today,
};
