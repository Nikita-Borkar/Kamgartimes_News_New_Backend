const mongoose = require("mongoose");
const Article = require("../models/Article");
const ArticleReaction = require("../models/ArticleReaction");
const Comment = require("../models/Comment");
const Category = require("../models/Category");
const User = require("../models/User");
const slugify = require("../utils/slugify");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertValidId = (id, label) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError(`Invalid ${label} ID`);
};

const assertCategoryExists = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) throw new BadRequestError("Category not found");
};

const listArticles = async ({ status, category, search, page = 1, limit = 20 }) => {
  const filter = {};
  if (status) filter.status = status;
  if (category) {
    assertValidId(category, "category");
    filter.category = category;
  }
  if (search) filter.title = { $regex: escapeRegex(search), $options: "i" };

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [articles, total] = await Promise.all([
    Article.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("category", "name slug")
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
    .populate("author", "name")
    .populate("createdBy", "name")
    .populate("updatedBy", "name");
  if (!article) throw new NotFoundError("Article not found");
  return article;
};

const createArticle = async (body, userId) => {
  const { title, slug, summary, content, category, author, featuredImage, seo } = body;

  await assertCategoryExists(category);

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

  const { title, slug, summary, content, category, author, featuredImage, seo } = body;

  if (category !== undefined) {
    await assertCategoryExists(category);
    article.category = category;
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
  listArticles,
  getArticleById,
  createArticle,
  updateArticle,
  updateArticleStatus,
  deleteArticle,
  moderateComment,
  deleteComment,
};

