const {
  listRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getPermissionsDropdown,
} = require("../services/roleService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const roles = await listRoles();
    return res
      .status(200)
      .json(new successResponse(200, "Roles fetched successfully", roles));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const role = await getRoleById(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Role fetched successfully", role));
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const role = await createRole(req.validatedBody);
    return res
      .status(201)
      .json(new successResponse(201, "Role created successfully", role));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const role = await updateRole(req.params.id, req.validatedBody);
    return res
      .status(200)
      .json(new successResponse(200, "Role updated successfully", role));
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await deleteRole(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Role deleted successfully", result));
  } catch (err) {
    next(err);
  }
};

const getPermissions = async (req, res, next) => {
  try {
    const data = await getPermissionsDropdown();
    return res
      .status(200)
      .json(
        new successResponse(200, "Permissions dropdown fetched successfully", data)
      );
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, remove, getPermissions };