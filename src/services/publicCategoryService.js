const Category = require("../models/Category");
const NotFoundError = require("../errors/customErrors/NotFoundError");

// Reader-site navigation: active categories as a two-level tree, ordered by
// the editorial `order` field.
const listPublicCategories = async () => {
  const categories = await Category.find({ isActive: true })
    .sort({ order: 1, name: 1 })
    .select("name slug description parent order")
    .lean();

  const childrenByParent = new Map();
  const roots = [];

  for (const category of categories) {
    if (!category.parent) {
      roots.push({ ...category, subcategories: [] });
      continue;
    }
    const key = String(category.parent);
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key).push(category);
  }

  for (const root of roots) {
    root.subcategories = childrenByParent.get(String(root._id)) || [];
  }

  return roots;
};

const getPublicCategoryBySlug = async (slug) => {
  const category = await Category.findOne({ slug: slug.toLowerCase(), isActive: true })
    .select("name slug description parent order")
    .lean();
  if (!category) throw new NotFoundError("Category not found");

  const subcategories = await Category.find({ parent: category._id, isActive: true })
    .sort({ order: 1, name: 1 })
    .select("name slug description order")
    .lean();

  return { ...category, subcategories };
};

module.exports = {
  listPublicCategories,
  getPublicCategoryBySlug,
};
