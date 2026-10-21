const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Role = require("../models/Role");
const User = require("../models/User");
const { ALL_PERMISSIONS } = require("../config/permissions");
const bcrypt = require("bcryptjs");

dotenv.config();

const ADMIN_PERMISSIONS = ALL_PERMISSIONS.slice();

const EDITOR_PERMISSIONS = [
  "category:read",
  "category:create",
  "category:update",
  "category:delete",
  "article:read",
  "article:create",
  "article:update",
  "article:delete",
  "article:publish",
  "comment:moderate",
  "media:read",
  "media:create",
  "media:update",
  "media:delete",
  "notice:read",
  "notice:create",
  "notice:update",
  "notice:delete",
  "ad:read",
  "ad:create",
  "ad:update",
  "ad:delete",
];

const USER_PERMISSIONS = ["article:read"];

const roles = [
  {
    name: "admin",
    displayName: "Administrator",
    description: "Full system access with all permissions",
    permissions: ADMIN_PERMISSIONS,
    isSystem: true,
    isActive: true,
  },
  {
    name: "editor",
    displayName: "Editor",
    description: "Can manage categories and view users",
    permissions: EDITOR_PERMISSIONS,
    isSystem: true,
    isActive: true,
  },
  {
    name: "user",
    displayName: "User",
    description: "Basic authenticated user",
    permissions: USER_PERMISSIONS,
    isSystem: true,
    isActive: true,
  },
];

const seedRoles = async () => {
  for (const roleData of roles) {
    await Role.findOneAndUpdate(
      { name: roleData.name },
      { $set: roleData },
      { upsert: true, returnDocument: "after" },
    );
    console.log(
      `Seeded role: ${roleData.name} (${roleData.permissions.length} permissions)`,
    );
  }

  console.log("Role seeding completed");
};

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    console.log("  - ADMIN_EMAIL not set, skipping admin user step");
    return;
  }

  const normalisedEmail = email.toLowerCase();
  let user = await User.findOne({ email: normalisedEmail });

  if (!user) {
    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
      console.log(
        `  - user ${normalisedEmail} does not exist and ADMIN_PASSWORD is not set, skipping`,
      );
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({
      name: process.env.ADMIN_NAME || "Administrator",
      email: normalisedEmail,
      password: hashedPassword,
      role: "admin",
    });
    console.log(`  - created admin user ${normalisedEmail}`);
    return;
  }

  if (user.role !== "admin") {
    user.role = "admin";
    await user.save();
    console.log(`  - promoted ${normalisedEmail} to admin`);
  } else {
    console.log(`  - ${normalisedEmail} is already an admin`);
  }
};

const seedEditor = async () => {
  const email = process.env.EDITOR_EMAIL;
  if (!email) {
    console.log("  - EDITOR_EMAIL not set, skipping editor user step");
    return;
  }

  const normalisedEmail = email.toLowerCase();
  let user = await User.findOne({ email: normalisedEmail });

  if (!user) {
    const password = process.env.EDITOR_PASSWORD;
    if (!password) {
      console.log(
        `  - user ${normalisedEmail} does not exist and EDITOR_PASSWORD is not set, skipping`,
      );
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({
      name: process.env.EDITOR_NAME || "Senior Editor",
      email: normalisedEmail,
      password: hashedPassword,
      role: "editor",
    });
    console.log(`  - created editor user ${normalisedEmail}`);
    return;
  }

  if (user.role !== "editor") {
    user.role = "editor";
    await user.save();
    console.log(`  - set ${normalisedEmail} role to editor`);
  } else {
    console.log(`  - ${normalisedEmail} is already an editor`);
  }
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected for seeding");

    await seedRoles();
    await seedAdmin();
    await seedEditor();

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  }
};

run();
