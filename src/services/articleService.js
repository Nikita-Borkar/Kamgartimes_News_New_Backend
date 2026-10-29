const mongoose = require("mongoose");
const Article = require("../models/Article");
const ArticleReaction = require("../models/ArticleReaction");
const Comment = require("../models/Comment");
const Category = require("../models/Category");
const City = require("../models/City");
const User = require("../models/User");
const slugify = require("../utils/slugify");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");
const { uploadBuffer } = require("../config/cloudinary");
const path = require("path");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const uploadArticlePdf = async (file) => {
  if (!file?.buffer) throw new BadRequestError("PDF file is required");
  if (file.buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new BadRequestError("The uploaded file is not a valid PDF");
  }

  const baseName = path
    .basename(file.originalname, path.extname(file.originalname))
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "article-document";

  try {
    const uploaded = await uploadBuffer(file.buffer, {
      folder: "kamgartimes/articles/pdfs",
      resource_type: "image",
      type: "upload",
      public_id: `${Date.now()}-${baseName}`,
    });
    return { url: uploaded.secure_url, filename: file.originalname, bytes: uploaded.bytes };
  } catch (err) {
    throw new BadRequestError(`PDF upload failed: ${err.message}`);
  }
};

const assertValidId = (id, label) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError(`Invalid ${label} ID`);
};

const assertCategoryExists = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) throw new BadRequestError("Category not found");
};

const assertCityExists = async (cityId) => {
  if (!cityId) return;
  const city = await City.findById(cityId);
  if (!city) throw new BadRequestError("City not found");
};

// Trim, drop blanks and de-duplicate reader-facing string arrays.
const cleanStringArray = (values) => {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))];
};

const estimateReadTime = (content) => {
  const text =
    typeof content === "string" ? content.replace(/<[^>]*>/g, " ") : JSON.stringify(content || "");
  const words = text.split(/\s+/).filter(Boolean).length;
  if (!words) return "";
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
};

const listArticles = async ({
  status,
  category,
  city,
  search,
  tag,
  isLead,
  isFeatured,
  isTrending,
  isEditorsPick,
  isBreaking,
  page = 1,
  limit = 20,
}) => {
  const filter = {};
  if (status) filter.status = status;
  if (category) {
    assertValidId(category, "category");
    filter.category = category;
  }
  if (city) {
    assertValidId(city, "city");
    filter.city = city;
  }
  if (tag) filter.tags = tag;
  if (search) {
    const rx = { $regex: escapeRegex(search), $options: "i" };
    filter.$or = [{ title: rx }, { summary: rx }, { tags: rx }];
  }

  for (const [field, value] of Object.entries({
    isLead,
    isFeatured,
    isTrending,
    isEditorsPick,
    isBreaking,
  })) {
    if (value !== undefined) filter[field] = value === "true" || value === true;
  }

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [articles, total] = await Promise.all([
    Article.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("category", "name slug")
      .populate("city", "name slug")
      .populate("author", "name")
      .populate("createdBy", "name")
      .populate("updatedBy", "name"),
    Article.countDocuments(filter),
  ]);

  return { articles, total, page: pageNum, limit: limitNum };
};

const getArticleById = async (id) => {
  assertValidId(id, "article");
  const article = await Article.findById(id)
    .populate("category", "name slug")
    .populate("city", "name slug")
    .populate("author", "name")
    .populate("createdBy", "name")
    .populate("updatedBy", "name");
  if (!article) throw new NotFoundError("Article not found");
  return article;
};

const createArticle = async (body, userId) => {
  const {
    title,
    slug,
    summary,
    content,
    category,
    author,
    city,
    featuredImage,
    keyPoints,
    tags,
    readTime,
    isLead,
    isFeatured,
    isTrending,
    isEditorsPick,
    isBreaking,
    seo,
  } = body;

  await assertCategoryExists(category);
  await assertCityExists(city);

  if (author) {
    const authorUser = await User.findById(author);
    if (!authorUser) throw new BadRequestError("Author not found");
  }

  const finalSlug = slugify(slug || title);
  if (!finalSlug) throw new BadRequestError("Could not generate a slug from the title");

  const existingSlug = await Article.findOne({ slug: finalSlug });
  if (existingSlug) throw new BadRequestError("Article with this slug already exists");

  // Articles always start as drafts; publishing goes through
  // updateArticleStatus which requires article:publish.
  const article = await Article.create({
    title,
    slug: finalSlug,
    summary,
    content,
    featuredImage: featuredImage || "",
    category,
    author: author || userId,
    city: city || null,
    keyPoints: cleanStringArray(keyPoints),
    tags: cleanStringArray(tags),
    readTime: readTime || estimateReadTime(content),
    isLead: isLead === true,
    isFeatured: isFeatured === true,
    isTrending: isTrending === true,
    isEditorsPick: isEditorsPick === true,
    isBreaking: isBreaking === true,
    status: "DRAFT",
    publishedAt: null,
    seo: {
      metaTitle: seo?.metaTitle || "",
      metaDescription: seo?.metaDescription || "",
      keywords: seo?.keywords || [],
    },
    createdBy: userId,
    updatedBy: null,
  });

  return article;
};

const updateArticle = async (id, body, userId) => {
  assertValidId(id, "article");
  const article = await Article.findById(id);
  if (!article) throw new NotFoundError("Article not found");

  const {
    title,
    slug,
    summary,
    content,
    category,
    author,
    city,
    featuredImage,
    keyPoints,
    tags,
    readTime,
    isLead,
    isFeatured,
    isTrending,
    isEditorsPick,
    isBreaking,
    seo,
  } = body;

  if (category !== undefined) {
    await assertCategoryExists(category);
    article.category = category;
  }

  if (city !== undefined) {
    await assertCityExists(city);
    article.city = city || null;
  }

  if (author !== undefined) {
    const authorUser = await User.findById(author);
    if (!authorUser) throw new BadRequestError("Author not found");
    article.author = author;
  }

  if (title !== undefined) article.title = title;
  if (summary !== undefined) article.summary = summary;
  if (content !== undefined) article.content = content;
  if (featuredImage !== undefined) article.featuredImage = featuredImage;
  if (keyPoints !== undefined) article.keyPoints = cleanStringArray(keyPoints);
  if (tags !== undefined) article.tags = cleanStringArray(tags);
  if (readTime !== undefined) article.readTime = readTime;
  else if (content !== undefined && !article.readTime) {
    article.readTime = estimateReadTime(content);
  }

  for (const [field, value] of Object.entries({
    isLead,
    isFeatured,
    isTrending,
    isEditorsPick,
    isBreaking,
  })) {
    if (value !== undefined) article[field] = value === true;
  }

  // The slug is the public URL — only change it when explicitly provided so
  // existing article links never break on a title edit.
  if (slug !== undefined) {
    const finalSlug = slugify(slug);
    if (!finalSlug) throw new BadRequestError("Invalid slug");
    const existing = await Article.findOne({ slug: finalSlug, _id: { $ne: id } });
    if (existing) throw new BadRequestError("Article with this slug already exists");
    article.slug = finalSlug;
  }

  if (seo !== undefined) {
    article.seo = {
      metaTitle: seo.metaTitle || "",
      metaDescription: seo.metaDescription || "",
      keywords: seo.keywords || [],
    };
  }

  article.updatedBy = userId;
  await article.save();
  return article;
};

const updateArticleFlags = async (id, flags, userId) => {
  assertValidId(id, "article");
  const article = await Article.findById(id);
  if (!article) throw new NotFoundError("Article not found");

  for (const [field, value] of Object.entries(flags)) {
    if (value !== undefined) article[field] = value === true;
  }

  article.updatedBy = userId;
  await article.save();

  return {
    id: article._id,
    isLead: article.isLead,
    isFeatured: article.isFeatured,
    isTrending: article.isTrending,
    isEditorsPick: article.isEditorsPick,
    isBreaking: article.isBreaking,
  };
};

const updateArticleStatus = async (id, status) => {
  assertValidId(id, "article");
  const article = await Article.findById(id);
  if (!article) throw new NotFoundError("Article not found");

  article.status = status;
  if (status === "PUBLISHED" && !article.publishedAt) {
    article.publishedAt = new Date();
  }
  if (status === "DRAFT") {
    article.publishedAt = null;
  }

  await article.save();
  return { id: article._id, status: article.status, publishedAt: article.publishedAt };
};

const deleteArticle = async (id) => {
  assertValidId(id, "article");
  const article = await Article.findById(id);
  if (!article) throw new NotFoundError("Article not found");

  // Remove dependent reader data along with the article
  await Promise.all([
    ArticleReaction.deleteMany({ article: id }),
    Comment.deleteMany({ article: id }),
    article.deleteOne(),
  ]);

  return { id, deleted: true };
};

const moderateComment = async (commentId, status) => {
  assertValidId(commentId, "comment");
  const comment = await Comment.findById(commentId);
  if (!comment) throw new NotFoundError("Comment not found");
  if (comment.status === status) return { id: comment._id, status: comment.status };

  comment.status = status;
  await comment.save();

  // stats.comments only tracks comments visible on the reader site
  const delta = status === "APPROVED" ? 1 : -1;
  await Article.updateOne({ _id: comment.article }, { $inc: { "stats.comments": delta } });

  return { id: comment._id, status: comment.status };
};

const listCommentsForModeration = async ({ status, search, page = 1, limit = 20 } = {}) => {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const filter = {};
  if (status) filter.status = status;
  if (search?.trim()) {
    const rx = { $regex: escapeRegex(search.trim()), $options: "i" };
    const matchingArticles = await Article.find({ title: rx }).distinct("_id");
    const matchingUsers = await User.find({ name: rx }).distinct("_id");
    filter.$or = [
      { body: rx },
      { article: { $in: matchingArticles } },
      { user: { $in: matchingUsers } },
    ];
  }

  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("user", "name email")
      .populate("article", "title slug"),
    Comment.countDocuments(filter),
  ]);

  return { comments, total, page: pageNum, limit: limitNum };
};

const deleteComment = async (commentId) => {
  assertValidId(commentId, "comment");
  const comment = await Comment.findById(commentId);
  if (!comment) throw new NotFoundError("Comment not found");

  // Replies are always top-level children, so one level of cascade is enough
  const replies = await Comment.find({ parent: comment._id });

  let removedVisible = replies.filter((r) => r.status === "APPROVED").length;
  if (comment.status === "APPROVED") removedVisible += 1;

  await Comment.deleteMany({ $or: [{ _id: comment._id }, { parent: comment._id }] });

  if (removedVisible > 0) {
    await Article.updateOne(
      { _id: comment.article },
      { $inc: { "stats.comments": -removedVisible } },
    );
  }

  return { id: commentId, deleted: true };
};

module.exports = {
  uploadArticlePdf,
  listArticles,
  getArticleById,
  createArticle,
  updateArticle,
  updateArticleFlags,
  updateArticleStatus,
  deleteArticle,
  moderateComment,
  listCommentsForModeration,
  deleteComment,
};

