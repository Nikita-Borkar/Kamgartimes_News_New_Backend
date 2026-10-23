const Article = require("../models/Article");
const Category = require("../models/Category");
const Videos = require("../models/VideoMedia");
const Gallery = require("../models/Gallery");
const EpaperEdition = require("../models/EpaperEdition");
const Poll = require("../models/Poll");
const Notice = require("../models/Notice");

const CARD_FIELDS = "-content -seo -createdBy -updatedBy";

const populateArticle = (query) =>
  query
    .populate("category", "name slug")
    .populate("city", "name slug")
    .populate("author", "name");

const findArticles = (filter, limit) =>
  populateArticle(
    Article.find({ status: "PUBLISHED", ...filter })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select(CARD_FIELDS),
  ).lean();

const activeWindow = (now) => ({
  $and: [
    { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
    { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
  ],
});

// One cacheable payload for the reader homepage. Flags are editor-curated;
// when a rail has no flagged stories we fall back to the latest published
// articles so a fresh install still renders a complete page.
const getPublicHome = async () => {
  const now = new Date();

  const latestQuery = populateArticle(
    Article.find({ status: "PUBLISHED" })
      .sort({ publishedAt: -1 })
      .limit(12)
      .select(CARD_FIELDS),
  );

  const recentNotices = Notice.find({
    isActive: true,
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
    ],
  })
    .sort({ priority: -1, createdAt: -1 })
    .select("title message linkUrl linkText kind priority createdAt")
    .lean();

  const [
    lead,
    featured,
    trending,
    editorsPicks,
    breaking,
    latest,
    latestTotal,
    categories,
    videos,
    shorts,
    galleries,
    epaper,
    poll,
    notices,
  ] = await Promise.all([
    findArticles({ isLead: true }, 5),
    findArticles({ isFeatured: true }, 6),
    findArticles({ isTrending: true }, 6),
    findArticles({ isEditorsPick: true }, 4),
    findArticles({ isBreaking: true }, 5),
    latestQuery.lean(),
    Article.countDocuments({ status: "PUBLISHED" }),
    Category.find({ isActive: true, parent: null })
      .sort({ order: 1, name: 1 })
      .limit(8)
      .select("name slug description order")
      .lean(),
    findVideos("VIDEO", 4),
    findVideos("SHORT", 8),
    Gallery.find({ status: "PUBLISHED" })
      .sort({ publishedAt: -1 })
      .limit(4)
      .select("title slug description coverImage images category publishedAt")
      .populate("category", "name slug")
      .lean(),
    EpaperEdition.findOne({ isActive: true })
      .sort({ editionDate: -1 })
      .select("title slug editionDate pdfUrl coverImageUrl pageCount fileSize blurb city")
      .populate("city", "name slug")
      .lean(),
    Poll.findOne({ isActive: true, ...activeWindow(now) })
      .sort({ createdAt: -1 })
      .select("question options totalVotes startDate endDate")
      .lean(),
    recentNotices,
  ]);

  const sections = await Promise.all(
    categories.map(async (category) => ({
      category,
      articles: await findArticles({ category: category._id }, 4),
    })),
  );

  const fallbackLead = lead.length ? lead : latest.slice(0, 5);

  return {
    generatedAt: now.toISOString(),
    breaking,
    lead: fallbackLead,
    featured: featured.length ? featured : latest.slice(0, 4),
    trending: trending.length ? trending : latest.slice(0, 6),
    editorsPicks: editorsPicks.length ? editorsPicks : latest.slice(0, 4),
    latest: { articles: latest, total: latestTotal, page: 1, limit: 12 },
    sections: sections.filter((section) => section.articles.length > 0),
    videos,
    shorts,
    galleries,
    epaper,
    notices: notices.filter((notice) => notice.kind !== "BREAKING"),
    poll,
  };
};

function findVideos(videoType, limit) {
  return Videos.find({ status: "PUBLISHED", videoType })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("title altText youtubeVideoID thumbnailUrl videoType category createdAt")
    .populate("category", "name slug")
    .lean();
}

module.exports = { getPublicHome };
