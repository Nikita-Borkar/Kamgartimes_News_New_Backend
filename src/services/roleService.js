const mongoose = require("mongoose");
const Role = require("../models/Role");
const User = require("../models/User");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const ForbiddenError = require("../errors/customErrors/ForbiddenError");

const { PERMISSION_GROUPS, ALL_PERMISSIONS } = require("../config/permissions");

const listRoles = async () => {
  const roles = await Role.find({}).sort({ createdAt: -1 });
  return roles;
};

const getRoleById = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError("Invalid role ID");
  const role = await Role.findById(id);
  if (!role) throw new BadRequestError("Role not found");
  return role;
};

const createRole = async ({ name, displayName, description, permissions }) => {
  const existing = await Role.findOne({ name });
  if (existing) throw new BadRequestError("Role already exists");

  const role = await Role.create({
    name,
    displayName,
    description: description || "",
    permissions: permissions || [],
  });
  return role;
};

const updateRole = async (id, { displayName, description, permissions }) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError("Invalid role ID");
  const role = await Role.findById(id);
  if (!role) throw new BadRequestError("Role not found");

  // Protect the built-in admin role from being modified
  if (role.isSystem && role.name === "admin") {
    throw new ForbiddenError("Admin role cannot be modified");
  }

  if (displayName !== undefined) role.displayName = displayName;
  if (description !== undefined) role.description = description;
  if (permissions !== undefined) role.permissions = permissions;

  await role.save();
  return role;
};

const deleteRole = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError("Invalid role ID");
  const role = await Role.findById(id);
  if (!role) throw new BadRequestError("Role not found");

  if (role.isSystem) {
    throw new ForbiddenError("System roles cannot be deleted");
  }

  // Prevent deleting a role that is currently assigned to users
  const usersWithRole = await User.countDocuments({ role: role.name });
  if (usersWithRole > 0) {
    throw new BadRequestError("Cannot delete role assigned to one or more users");
  }

  await role.deleteOne();
  return { id };
};

const getPermissionsDropdown = async () => {
  const groups = PERMISSION_GROUPS.map((group) => {
    const permissions = group.permissions.map((perm) => {
      const parts = perm.split(":");
      const action = parts[1] || parts[0];
      const actionLabel = action
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      return {
        value: perm,
        label: `${group.label}: ${actionLabel}`,
        action,
        actionLabel,
        resource: group.resource,
      };
    });

    return {
      resource: group.resource,
      label: group.label,
      permissions,
    };
  });

  const options = groups.flatMap((g) => g.permissions);

  return {
    groups,
    options,
    allPermissions: ALL_PERMISSIONS,
  };
};

module.exports = {
  listRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getPermissionsDropdown,
};