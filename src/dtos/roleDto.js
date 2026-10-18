const z = require("zod");
const { ALL_PERMISSIONS } = require("../config/permissions");

const permissionArray = z.array(z.string()).refine(
  (vals) => vals.every((p) => ALL_PERMISSIONS.includes(p)),
  { message: "One or more permissions are not recognised" }
);

const createRoleSchema = z.object({
  name: z
    .string()
    .nonempty()
    .min(1)
    .max(50)
    .regex(
      /^[a-z][a-z0-9_]*$/,
      "Role name may only contain lowercase letters, numbers and underscores"
    ),
  displayName: z.string().nonempty().max(100),
  description: z.string().optional().default(""),
  permissions: permissionArray.default([]),
});

const updateRoleSchema = z.object({
  displayName: z.string().nonempty().max(100).optional(),
  description: z.string().optional(),
  permissions: permissionArray.optional(),
});

module.exports = { createRoleSchema, updateRoleSchema };