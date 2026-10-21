const mongoose = require("mongoose");
const StaticPage = require("../models/StaticPage");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

const listStaticPages = async ({
  isActive,
  showInFooter,
  showInHeader,
  search,
  page = 1,
  limit = 20,
} = {}) => {
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (showInFooter !== undefined)
    filter.showInFooter = showInFooter === "true";
  if (showInHeader !== undefined)
    filter.showInHeader = showInHeader === "true";
  if (search) {
    filter.$or = [
      { title: { $regex: new RegExp(search, "i") } },
      { slug: { $regex: new RegExp(search, "i") } },
    ];
  }

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [pages, total] = await Promise.all([
    StaticPage.find(filter)
      .sort({ sortOrder: 1, title: 1 })
      .skip(skip)
      .limit(limitNum)
      .populate("createdBy", "name")
      .populate("updatedBy", "name"),
    StaticPage.countDocuments(filter),
  ]);

  return { pages, total, page: pageNum, limit: limitNum };
};

const getStaticPageById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new BadRequestError("Invalid static page ID");
  }
  const page = await StaticPage.findById(id)
    .populate("createdBy", "name")
    .populate("updatedBy", "name");
  if (!page) throw new NotFoundError("Static page not found");
  return page;
};

const createStaticPage = async (body, userId) => {
  const { title, slug, content, excerpt, ...rest } = body;

  const finalSlug = slug || slugify(title);

  const existingSlug = await StaticPage.findOne({ slug: finalSlug });
  if (existingSlug) {
    throw new BadRequestError("Static page with this slug already exists");
  }

  const page = await StaticPage.create({
    title,
    slug: finalSlug,
    content,
    excerpt: excerpt || "",
    ...rest,
    createdBy: userId,
    updatedBy: userId,
  });

  return page;
};

const updateStaticPage = async (id, body, userId) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new BadRequestError("Invalid static page ID");
  }
  const page = await StaticPage.findById(id);
  if (!page) throw new NotFoundError("Static page not found");

  const { title, slug, content, excerpt, ...rest } = body;

  if (slug !== undefined && slug !== page.slug) {
    const existing = await StaticPage.findOne({ slug, _id: { $ne: id } });
    if (existing) {
      throw new BadRequestError("Static page with this slug already exists");
    }
    page.slug = slug;
  } else if (title !== undefined && title !== page.title) {
    page.slug = slugify(title);
  }

  if (title !== undefined) page.title = title;
  if (content !== undefined) page.content = content;
  if (excerpt !== undefined) page.excerpt = excerpt;

  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) page[key] = value;
  }

  page.updatedBy = userId;
  await page.save();

  return page;
};

const deleteStaticPage = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new BadRequestError("Invalid static page ID");
  }
  const page = await StaticPage.findById(id);
  if (!page) throw new NotFoundError("Static page not found");

  page.isActive = false;
  await page.save();
  return { id, isActive: page.isActive };
};

// Public: get a published static page by slug
const getPublicStaticPageBySlug = async (slug) => {
  const page = await StaticPage.findOne({ slug, isActive: true }).lean();
  if (!page) throw new NotFoundError("Static page not found");
  return page;
};

module.exports = {
  listStaticPages,
  getStaticPageById,
  createStaticPage,
  updateStaticPage,
  deleteStaticPage,
  getPublicStaticPageBySlug,
};
