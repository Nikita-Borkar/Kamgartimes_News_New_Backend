const Role = require("../models/Role");
const ForbiddenError = require("../errors/customErrors/ForbiddenError");

// Attach the authenticated user's role permissions to req.permissions
// so downstream requirePermission middleware can authorize the request.
const loadPermissions = async (req, res, next) => {
  try {
    const role = await Role.findOne({ name: req.user.role, isActive: true });
    req.permissions = role ? role.permissions : [];
    req.role = role;
    next();
  } catch (err) {
    next(err);
  }
};

// Require ALL listed permissions (AND logic).
const requirePermission = (...permissions) => (req, res, next) => {
  const userPermissions = req.permissions || [];
  const missing = permissions.filter((p) => !userPermissions.includes(p));
  if (missing.length) {
    throw new ForbiddenError(`Insufficient permissions: ${missing.join(", ")}`);
  }
  next();
};

// Require ANY one of the listed permissions (OR logic).
const requireAnyPermission = (...permissions) => (req, res, next) => {
  const userPermissions = req.permissions || [];
  const hasAny = permissions.some((p) => userPermissions.includes(p));
  if (!hasAny) {
    throw new ForbiddenError(`Insufficient permissions: one of [${permissions.join(", ")}] required`);
  }
  next();
};

// Require the user to have one of the listed roles.
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new ForbiddenError(`Insufficient role: one of [${roles.join(", ")}] required`);
  }
  next();
};

module.exports = {
  loadPermissions,
  requirePermission,
  requireAnyPermission,
  requireRole,
};