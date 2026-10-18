const PERMISSIONS = {
  // User management
  USER_READ: "user:read",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  USER_ASSIGN_ROLE: "user:assign_role",

  // Role management
  ROLE_READ: "role:read",
  ROLE_CREATE: "role:create",
  ROLE_UPDATE: "role:update",
  ROLE_DELETE: "role:delete",

  // Categories
  CATEGORY_READ: "category:read",
  CATEGORY_CREATE: "category:create",
  CATEGORY_UPDATE: "category:update",
  CATEGORY_DELETE: "category:delete",
};

// Grouped view used by the API/frontend so the UI can render
// checkboxes per section instead of one long flat list.
const PERMISSION_GROUPS = [
  {
    resource: "user",
    label: "Users",
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.USER_CREATE,
      PERMISSIONS.USER_UPDATE,
      PERMISSIONS.USER_DELETE,
      PERMISSIONS.USER_ASSIGN_ROLE,
    ],
  },
  {
    resource: "role",
    label: "Roles",
    permissions: [
      PERMISSIONS.ROLE_READ,
      PERMISSIONS.ROLE_CREATE,
      PERMISSIONS.ROLE_UPDATE,
      PERMISSIONS.ROLE_DELETE,
    ],
  },
  {
    resource: "category",
    label: "Categories",
    permissions: [
      PERMISSIONS.CATEGORY_READ,
      PERMISSIONS.CATEGORY_CREATE,
      PERMISSIONS.CATEGORY_UPDATE,
      PERMISSIONS.CATEGORY_DELETE,
    ],
  },
];

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

module.exports = {
  PERMISSIONS,
  PERMISSION_GROUPS,
  ALL_PERMISSIONS,
};
