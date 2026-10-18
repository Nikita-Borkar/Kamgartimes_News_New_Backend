const mongoose = require("mongoose");
const Category = require("../models/Category");
const BadRequestError = require("../errors/customErrors/BadRequestError");

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

const listCategories = async ({ parent, isActive, page = 1, limit = 20 }) => {
  const filter = {};
  if (parent !== undefined) {
    filter.parent = parent === "null" || parent === "" ? null : parent;
  }
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [categories, total] = await Promise.all([
    Category.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Category.countDocuments(filter),
  ]);

  return { categories, total, page: parseInt(page), limit: parseInt(limit) };
};

const getCategoryById = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError("Invalid category ID");
  const category = await Category.findById(id);
  if (!category) throw new BadRequestError("Category not found");
  return category;
};

const createCategory = async ({ name, slug, description, parent, isActive, order }) => {
  const finalSlug = slug || slugify(name);

  const existingSlug = await Category.findOne({ slug: finalSlug });
  if (existingSlug) throw new BadRequestError("Category with this slug already exists");

  const existingName = await Category.findOne({ name });
  if (existingName) throw new BadRequestError("Category with this name already exists");

  if (parent) {
    if (!mongoose.isValidObjectId(parent)) throw new BadRequestError("Invalid parent category ID");
    const parentCategory = await Category.findById(parent);
    if (!parentCategory) throw new BadRequestError("Parent category not found");
  }

  const category = await Category.create({
    name,
    slug: finalSlug,
    description: description || "",
    parent: parent || null,
    isActive: isActive !== undefined ? isActive : true,
    order: order || 0,
  });

  return category;
};

const updateCategory = async (id, { name, slug, description, parent, isActive, order }) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError("Invalid category ID");
  const category = await Category.findById(id);
  if (!category) throw new BadRequestError("Category not found");

  if (name !== undefined) {
    const existing = await Category.findOne({ name, _id: { $ne: id } });
    if (existing) throw new BadRequestError("Category with this name already exists");
    category.name = name;
  }

  if (slug !== undefined) {
    const existing = await Category.findOne({ slug, _id: { $ne: id } });
    if (existing) throw new BadRequestError("Category with this slug already exists");
    category.slug = slug;
  } else if (name !== undefined) {
    category.slug = slugify(name);
  }

  if (description !== undefined) category.description = description;
  if (isActive !== undefined) category.isActive = isActive;
  if (order !== undefined) category.order = order;

  if (parent !== undefined) {
    if (parent === null || parent === "") {
      category.parent = null;
    } else {
      if (!mongoose.isValidObjectId(parent)) throw new BadRequestError("Invalid parent category ID");
      if (parent === id) throw new BadRequestError("A category cannot be its own parent");
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) throw new BadRequestError("Parent category not found");
      category.parent = parent;
    }
  }

  await category.save();
  return category;
};

const deleteCategory = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError("Invalid category ID");
  const category = await Category.findById(id);
  if (!category) throw new BadRequestError("Category not found");

  const children = await Category.countDocuments({ parent: id });
  if (children > 0) {
    throw new BadRequestError(
      "Cannot deactivate category with subcategories. Deactivate subcategories first."
    );
  }

  category.isActive = false;
  await category.save();
  return { id, isActive: category.isActive };
};

const getSubCategories = async (parentId) => {
  if (!mongoose.isValidObjectId(parentId)) throw new BadRequestError("Invalid category ID");
  const subcategories = await Category.find({ parent: parentId, isActive: true }).sort({
    order: 1,
    name: 1,
  });
  return subcategories;
};

const getCategoryTree = async () => {
  const mainCategories = await Category.find({ parent: null, isActive: true }).sort({
    order: 1,
    name: 1,
  });
  const tree = [];
  for (const main of mainCategories) {
    const subs = await Category.find({ parent: main._id, isActive: true }).sort({
      order: 1,
      name: 1,
    });
    tree.push({
      ...main.toObject(),
      subcategories: subs,
    });
  }
  return tree;
};

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubCategories,
  getCategoryTree,
};