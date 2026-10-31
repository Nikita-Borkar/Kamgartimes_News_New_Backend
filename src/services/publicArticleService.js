const mongoose = require("mongoose");
const Article = require("../models/Article");
const ArticleReaction = require("../models/ArticleReaction");
const Comment = require("../models/Comment");
const Category = require("../models/Category");
const City = require("../models/City");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertValidId = (id, label) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError(`Invalid ${label} ID`);
};

// Reader site only ever sees published articles — drafts must look non-existent
const getPublishedArticle = async (id) => {
  assertValidId(id, "article");
  const article = await Article.findOne({ _id: id, status: "PUBLISHED" });
  if (!article) throw new NotFoundError("Article not found");
  return article;
};

const resolveCategoryId = async (categorySlug) => {
  const category = await Category.findOne({ slug: categorySlug.toLowerCase() }).select("_id");
  if (!category) throw new NotFoundError("Category not found");
  return category._id;
};

const resolveCityId = async (citySlug) => {
  const city = await City.findOne({ slug: citySlug.toLowerCase() }).select("_id");
  if (!city) throw new NotFoundError("City not found");
  return city._id;
};

const listPublishedArticles = async ({
  category,
  categorySlug,
  city,
  citySlug,
  search,
  tag,
  page = 1,
  limit = 12,
} = {}) => {
  const filter = { status: "PUBLISHED" };

  if (category) {
    assertValidId(category, "category");
    filter.category = category;
  } else if (categorySlug) {
    filter.category = await resolveCategoryId(categorySlug);
  }

  if (city) {
    assertValidId(city, "city");
    filter.city = city;
  } else if (citySlug) {
    filter.city = await resolveCityId(citySlug);
  }

  if (tag) filter.tags = tag;
  if (search) {
    const rx = { $regex: escapeRegex(search), $options: "i" };
    filter.$or = [{ title: rx }, { summary: rx }, { tags: rx }];
  }

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 12, 1), 50);
  const skip = (pageNum - 1) * limitNum;

  const [articles, total] = await Promise.all([
    Article.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      // Listing never ships the heavy rich-text body
      .select("-content")
      .populate("category", "name slug")
      .populate("city", "name slug")
      .populate("author", "name"),
    Article.countDocuments(filter),
  ]);

  return { articles, total, page: pageNum, limit: limitNum };
};

// Accepts either the public slug or a Mongo ObjectId so the website
// (/news/[id]) and the mobile app can address the same endpoint.
const getPublishedArticleBySlug = async (slug) => {
  if (!slug) throw new BadRequestError("Slug is required");
  const filter = mongoose.isValidObjectId(slug)
    ? { _id: slug, status: "PUBLISHED" }
    : { slug: slug.toLowerCase(), status: "PUBLISHED" };

  const article = await Article.findOne(filter)
    .populate("category", "name slug")
    .populate("city", "name slug")
    .populate("author", "name")
    .populate("publishedBy", "name");
  if (!article) throw new NotFoundError("Article not found");
  return article;
};

// Related band: same category first, newest published, current article excluded.
const getRelatedArticles = async (id, { limit = 3 } = {}) => {
  assertValidId(id, "article");
  const article = await Article.findOne({ _id: id, status: "PUBLISHED" }).select("category");
  if (!article) throw new NotFoundError("Article not found");

  const limitNum = Math.min(Math.max(parseInt(limit) || 3, 1), 10);

  return Article.find({
    _id: { $ne: article._id },
    status: "PUBLISHED",
    category: article.category,
  })
    .sort({ publishedAt: -1 })
    .limit(limitNum)
    .select("-content")
    .populate("category", "name slug")
    .populate("city", "name slug")
    .populate("author", "name")
    .lean();
};

// Public fire-and-forget counters: view / share / outbound link click
const STAT_FIELDS = { view: "views", share: "shares", click: "clicks" };

const incrementStat = async (id, kind) => {
  const field = STAT_FIELDS[kind];
  if (!field) throw new BadRequestError("Unknown stat");

  const article = await getPublishedArticle(id);
  const updated = await Article.findByIdAndUpdate(
    article._id,
    { $inc: { [`stats.${field}`]: 1 } },
    { new: true },
  );

  return { [field]: updated.stats[field] };
};

const getReactions = async (id, userId) => {
  const article = await getPublishedArticle(id);

  let userReaction = null;
  if (userId) {
    const reaction = await ArticleReaction.findOne({ article: article._id, user: userId });
    userReaction = reaction ? reaction.type : null;
  }

  return { likes: article.stats.likes, dislikes: article.stats.dislikes, userReaction };
};

// Like/dislike toggle: like→unlike, dislike→undislike, or switch sides.
const toggleReaction = async (id, userId, type) => {
  const article = await getPublishedArticle(id);
  const likeKey = type === "LIKE" ? "likes" : "dislikes";
  const dislikeKey = type === "LIKE" ? "dislikes" : "likes";

  const existing = await ArticleReaction.findOne({ article: article._id, user: userId });

  if (!existing) {
    try {
      await ArticleReaction.create({ article: article._id, user: userId, type });
      await Article.updateOne({ _id: article._id }, { $inc: { [`stats.${likeKey}`]: 1 } });
      return {
        likes: article.stats.likes + (type === "LIKE" ? 1 : 0),
        dislikes: article.stats.dislikes + (type === "DISLIKE" ? 1 : 0),
        userReaction: type,
      };
    } catch (err) {
      // Lost a creation race — fall through and treat it as an existing reaction
      if (err.code !== 11000) throw err;
    }
  }

  const reaction =
    existing || (await ArticleReaction.findOne({ article: article._id, user: userId }));
  if (!reaction) throw new BadRequestError("Reaction could not be processed");

  if (reaction.type === type) {
    // Same side again → remove the reaction
    await reaction.deleteOne();
    await Article.updateOne({ _id: article._id }, { $inc: { [`stats.${likeKey}`]: -1 } });
    return {
      likes: article.stats.likes + (type === "LIKE" ? -1 : 0),
      dislikes: article.stats.dislikes + (type === "DISLIKE" ? -1 : 0),
      userReaction: null,
    };
  }

  // Switching sides → move one count across
  reaction.type = type;
  await reaction.save();
  await Article.updateOne(
    { _id: article._id },
    { $inc: { [`stats.${likeKey}`]: 1, [`stats.${dislikeKey}`]: -1 } },
  );
  return {
    likes: article.stats.likes + (type === "LIKE" ? 1 : -1),
    dislikes: article.stats.dislikes + (type === "DISLIKE" ? 1 : -1),
    userReaction: type,
  };
};

// Approved top-level comments (paginated) with their replies attached
const listComments = async (id, { page = 1, limit = 10 }) => {
  await getPublishedArticle(id);

  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 50);
  const skip = (pageNum - 1) * limitNum;

  const topFilter = { article: id, status: "APPROVED", parent: null };
  const [tops, total] = await Promise.all([
    Comment.find(topFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("user", "name"),
    Comment.countDocuments(topFilter),
  ]);

  const topIds = tops.map((c) => c._id);
  const replies = topIds.length
    ? await Comment.find({
        article: id,
        status: "APPROVED",
        parent: { $in: topIds },
      })
        .sort({ createdAt: 1 })
        .populate("user", "name")
    : [];

  const repliesByParent = new Map();
  for (const reply of replies) {
    const key = reply.parent.toString();
    if (!repliesByParent.has(key)) repliesByParent.set(key, []);
    repliesByParent.get(key).push(reply);
  }

  const comments = tops.map((top) => ({
    ...top.toObject(),
    replies: repliesByParent.get(top._id.toString()) || [],
  }));

  return { comments, total, page: pageNum, limit: limitNum };
};

// Public latest-news ticker: published articles from the last 24 hours,
// newest first. Optional category filter by ObjectId or slug.
const listLatestNewsTicker = async ({
  category,
  categorySlug,
  limit = 20,
} = {}) => {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const filter = {
    status: "PUBLISHED",
    publishedAt: { $gte: twentyFourHoursAgo },
  };

  if (category) {
    assertValidId(category, "category");
    filter.category = category;
  } else if (categorySlug) {
    filter.category = await resolveCategoryId(categorySlug);
  }

  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 50);

  return Article.find(filter)
    .sort({ publishedAt: -1 })
    .limit(limitNum)
    .select("-content")
    .populate("category", "name slug")
    .populate("author", "name");
};

// Login-only. New comments are auto-approved; moderators can hide them later.
const createComment = async (id, userId, { body, parent }) => {
  await getPublishedArticle(id);

  if (parent) {
    const parentComment = await Comment.findById(parent);
    if (!parentComment) throw new BadRequestError("Parent comment not found");
    if (parentComment.article.toString() !== id) {
      throw new BadRequestError("Parent comment belongs to a different article");
    }
    if (parentComment.status !== "APPROVED") {
      throw new BadRequestError("Cannot reply to a hidden comment");
    }
    if (parentComment.parent) {
      throw new BadRequestError("Replies can only be added to top-level comments");
    }
  }

  const comment = await Comment.create({
    article: id,
    user: userId,
    parent: parent || null,
    body,
    status: "APPROVED",
  });

  await Article.updateOne({ _id: id }, { $inc: { "stats.comments": 1 } });

  await comment.populate("user", "name");
  return comment;
};

module.exports = {
  listPublishedArticles,
  getPublishedArticleBySlug,
  getRelatedArticles,
  getPublishedArticle,
  incrementStat,
  getReactions,
  toggleReaction,
  listComments,
  createComment,
  listLatestNewsTicker,
};

