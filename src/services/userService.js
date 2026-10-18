const mongoose = require("mongoose");
const User = require("../models/User");
const Role = require("../models/Role");
const BadRequestError = require("../errors/customErrors/BadRequestError");

const listUsers = async () => {
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });
  return users;
};

const getUserById = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError("Invalid user ID");
  const user = await User.findById(id).select("-password");
  if (!user) throw new BadRequestError("User not found");
  return user;
};

const assignRoleToUser = async (userId, { role }) => {
  if (!mongoose.isValidObjectId(userId)) throw new BadRequestError("Invalid user ID");

  const user = await User.findById(userId);
  if (!user) throw new BadRequestError("User not found");

  const roleDoc = await Role.findOne({ name: role, isActive: true });
  if (!roleDoc) throw new BadRequestError("Role not found or inactive");

  user.role = role;
  await user.save();

  return { id: user._id, name: user.name, email: user.email, role: user.role };
};

const deactivateUser = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError("Invalid user ID");
  const user = await User.findById(id);
  if (!user) throw new BadRequestError("User not found");
  user.isActive = false;
  await user.save();
  return { id: user._id, isActive: user.isActive };
};

module.exports = { listUsers, getUserById, assignRoleToUser, deactivateUser };