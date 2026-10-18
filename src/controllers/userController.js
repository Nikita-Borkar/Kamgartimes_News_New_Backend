const {
  listUsers,
  getUserById,
  assignRoleToUser,
  deactivateUser,
} = require("../services/userService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const users = await listUsers();
    return res
      .status(200)
      .json(new successResponse(200, "Users fetched successfully", users));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "User fetched successfully", user));
  } catch (err) {
    next(err);
  }
};

const assignRole = async (req, res, next) => {
  try {
    const result = await assignRoleToUser(req.params.id, req.validatedBody);
    return res
      .status(200)
      .json(new successResponse(200, "Role assigned successfully", result));
  } catch (err) {
    next(err);
  }
};

const deactivate = async (req, res, next) => {
  try {
    const result = await deactivateUser(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "User deactivated successfully", result));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, assignRole, deactivate };