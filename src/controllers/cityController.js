const {
  listCities,
  listPublicCities,
  getCityById,
  getPublicCityBySlug,
  createCity,
  updateCity,
  deleteCity,
} = require("../services/cityService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const result = await listCities(req.validatedQuery);
    return res
      .status(200)
      .json(new successResponse(200, "Cities fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const publicList = async (req, res, next) => {
  try {
    const result = await listPublicCities();
    return res
      .status(200)
      .json(new successResponse(200, "Cities fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const city = await getCityById(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "City fetched successfully", city));
  } catch (err) {
    next(err);
  }
};

const getPublicBySlug = async (req, res, next) => {
  try {
    const city = await getPublicCityBySlug(req.params.slug);
    return res
      .status(200)
      .json(new successResponse(200, "City fetched successfully", city));
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const city = await createCity(req.validatedBody);
    return res
      .status(201)
      .json(new successResponse(201, "City created successfully", city));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const city = await updateCity(req.params.id, req.validatedBody);
    return res
      .status(200)
      .json(new successResponse(200, "City updated successfully", city));
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deleteCity(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "City deactivated successfully", result));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, publicList, getById, getPublicBySlug, create, update, remove };
