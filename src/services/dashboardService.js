const Article = require("../models/Article");
const Comment = require("../models/Comment");
const Category = require("../models/Category");
const City = require("../models/City");
const User = require("../models/User");
const Role = require("../models/Role");
const LiveNews = require("../models/LiveNews");
const Notice = require("../models/Notice");
const AdCampaign = require("../models/AdCampaign");
const AdClick = require("../models/AdClick");
const AdImpression = require("../models/AdImpression");
const AdPlacement = require("../models/AdPlacement");
const AdSlot = require("../models/AdSlot");
const AdInquiry = require("../models/AdInquiry");
const Poll = require("../models/Poll");
const PollVote = require("../models/PollVote");
const QuestionOfTheDay = require("../models/QuestionOfTheDay");
const ImageMedia = require("../models/ImageMedia");
const VideoMedia = require("../models/VideoMedia");
const Gallery = require("../models/Gallery");
const EpaperEdition = require("../models/EpaperEdition");
const StaticPage = require("../models/StaticPage");
const NewsTip = require("../models/NewsTip");
const ReporterApplication = require("../models/ReporterApplication");
const ContactMessage = require("../models/ContactMessage");
const { RANGE_DAYS } = require("../dtos/dashboardDto");

const IST_TZ = "Asia/Kolkata";
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const istDayStart = (date = new Date()) => {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  return new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) - IST_OFFSET_MS,
  );
};

const istDayKey = (date) =>
  new Date(date.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);

const buildDayKeys = (from, days) =>
  Array.from({ length: days }, (_, index) =>
    istDayKey(new Date(from.getTime() + index * DAY_MS)),
  );

const fillSeries = (rows, keys, valueKey) => {
  const byDate = new Map(rows.map((row) => [row._id, row[valueKey]]));
  return keys.map((date) => ({ date, [valueKey]: byDate.get(date) || 0 }));
};

const dailySeries = (Model, dateField, from, to, valueKey) =>
  Model.aggregate([
    { $match: { [dateField]: { $gte: from, $lte: to } } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: `$${dateField}`,
            timezone: IST_TZ,
          },
        },
        [valueKey]: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

const sumArticleField = (field) => ({
  $sum: { $ifNull: [`$stats.${field}`, 0] },
});

const mapArticle = (doc) => ({
  id: String(doc._id),
  title: doc.title,
  category: doc.category?.name || "Uncategorized",
  author: doc.author?.name || "Unknown",
  status: doc.status,
  views: doc.stats?.views || 0,
  likes: doc.stats?.likes || 0,
  comments: doc.stats?.comments || 0,
  isBreaking: Boolean(doc.isBreaking),
  isFeatured: Boolean(doc.isFeatured),
  image: doc.featuredImage || "",
  publishedAt: doc.publishedAt || null,
  createdAt: doc.createdAt || null,
});

const getArticleStats = async ({ todayStart, rangeFrom, rangeTo }) => {
  const [statusRows, engagementRows, comments, publishedToday, publishedInRange] =
    await Promise.all([
      Article.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Article.aggregate([
        {
          $group: {
            _id: null,
            views: sumArticleField("views"),
            likes: sumArticleField("likes"),
            dislikes: sumArticleField("dislikes"),
            shares: sumArticleField("shares"),
            clicks: sumArticleField("clicks"),
            comments: sumArticleField("comments"),
          },
        },
      ]),
      Comment.countDocuments(),
      Article.countDocuments({ status: "PUBLISHED", publishedAt: { $gte: todayStart } }),
      Article.countDocuments({
        status: "PUBLISHED",
        publishedAt: { $gte: rangeFrom, $lte: rangeTo },
      }),
    ]);

  const counts = new Map(statusRows.map((row) => [row._id, row.count]));
  const engagement = engagementRows[0] || {};

  return {
    total: (counts.get("PUBLISHED") || 0) + (counts.get("DRAFT") || 0),
    published: counts.get("PUBLISHED") || 0,
    draft: counts.get("DRAFT") || 0,
    publishedToday,
    publishedInRange,
    engagement: {
      views: engagement.views || 0,
      likes: engagement.likes || 0,
      dislikes: engagement.dislikes || 0,
      shares: engagement.shares || 0,
      clicks: engagement.clicks || 0,
      comments,
    },
  };
};

const getLiveNewsStats = async () => {
  const [total, active] = await Promise.all([
    LiveNews.countDocuments(),
    LiveNews.countDocuments({ isActive: true }),
  ]);
  return { total, active };
};

const getNoticeStats = async () => {
  const [total, active, breaking] = await Promise.all([
    Notice.countDocuments(),
    Notice.countDocuments({ isActive: true }),
    Notice.countDocuments({ isActive: true, kind: "BREAKING" }),
  ]);
  return { total, active, breaking };
};

const getAdsStats = async ({ rangeFrom, rangeTo, now, soon }) => {
  const window = { $gte: rangeFrom, $lte: rangeTo };
  const [
    campaigns,
    activeCampaigns,
    slots,
    activeSlots,
    placements,
    activePlacements,
    clicksInRange,
    impressionsInRange,
    impressionRows,
    endingSoon,
  ] = await Promise.all([
    AdCampaign.countDocuments(),
    AdCampaign.countDocuments({ isActive: true }),
    AdSlot.countDocuments(),
    AdSlot.countDocuments({ isActive: true }),
    AdPlacement.countDocuments(),
    AdPlacement.countDocuments({ isActive: true }),
    AdClick.countDocuments({ clickedAt: window }),
    AdImpression.countDocuments({ createdAt: window }),
    AdImpression.aggregate([
      { $match: { createdAt: window } },
      { $group: { _id: "$adCampaign", impressions: { $sum: 1 } } },
      { $sort: { impressions: -1 } },
      { $limit: 5 },
    ]),
    AdCampaign.find({ isActive: true, endDate: { $gte: now, $lte: soon } })
      .sort({ endDate: 1 })
      .limit(5)
      .select("title endDate")
      .lean(),
  ]);

  const campaignIds = impressionRows.map((row) => row._id);
  const [campaignDocs, clickRows] = await Promise.all([
    campaignIds.length
      ? AdCampaign.find({ _id: { $in: campaignIds } }).select("title isActive").lean()
      : [],
    campaignIds.length
      ? AdClick.aggregate([
          { $match: { adCampaign: { $in: campaignIds }, clickedAt: window } },
          { $group: { _id: "$adCampaign", clicks: { $sum: 1 } } },
        ])
      : [],
  ]);

  const campaignById = new Map(campaignDocs.map((doc) => [String(doc._id), doc]));
  const clicksById = new Map(clickRows.map((row) => [String(row._id), row.clicks]));

  return {
    summary: {
      campaigns,
      activeCampaigns,
      slots,
      activeSlots,
      placements,
      activePlacements,
      clicksInRange,
      impressionsInRange,
      ctr: impressionsInRange
        ? Number(((clicksInRange / impressionsInRange) * 100).toFixed(2))
        : 0,
    },
    topCampaigns: impressionRows.map((row) => {
      const doc = campaignById.get(String(row._id));
      const clicks = clicksById.get(String(row._id)) || 0;
      return {
        id: String(row._id),
        title: doc?.title || "Deleted campaign",
        isActive: doc ? doc.isActive : false,
        impressions: row.impressions,
        clicks,
        ctr: row.impressions ? Number(((clicks / row.impressions) * 100).toFixed(2)) : 0,
      };
    }),
    endingSoon: endingSoon.map((doc) => ({
      id: String(doc._id),
      title: doc.title,
      endDate: doc.endDate,
    })),
  };
};

const getPollStats = async () => {
  const [total, active, voteRows] = await Promise.all([
    Poll.countDocuments(),
    Poll.countDocuments({ isActive: true }),
    Poll.aggregate([{ $group: { _id: null, votes: { $sum: "$totalVotes" } } }]),
  ]);
  return { total, active, votes: voteRows[0]?.votes || 0 };
};

const getQotdStats = async () => {
  const [total, active] = await Promise.all([
    QuestionOfTheDay.countDocuments(),
    QuestionOfTheDay.countDocuments({ isActive: true }),
  ]);
  return { total, active };
};

const getLibraryStats = async () => {
  const [
    images,
    publishedImages,
    videos,
    publishedVideos,
    galleries,
    publishedGalleries,
    epaper,
    activeEpaper,
    categories,
    activeCategories,
    cities,
    activeCities,
    staticPages,
    activeStaticPages,
    latestEpaper,
  ] = await Promise.all([
    ImageMedia.countDocuments(),
    ImageMedia.countDocuments({ status: "PUBLISHED" }),
    VideoMedia.countDocuments(),
    VideoMedia.countDocuments({ status: "PUBLISHED" }),
    Gallery.countDocuments(),
    Gallery.countDocuments({ status: "PUBLISHED" }),
    EpaperEdition.countDocuments(),
    EpaperEdition.countDocuments({ isActive: true }),
    Category.countDocuments(),
    Category.countDocuments({ isActive: true }),
    City.countDocuments(),
    City.countDocuments({ isActive: true }),
    StaticPage.countDocuments(),
    StaticPage.countDocuments({ isActive: true }),
    EpaperEdition.findOne({ isActive: true })
      .sort({ editionDate: -1 })
      .select("title editionDate pageCount coverImageUrl")
      .lean(),
  ]);

  return {
    images: { total: images, published: publishedImages },
    videos: { total: videos, published: publishedVideos },
    galleries: { total: galleries, published: publishedGalleries },
    epaper: {
      total: epaper,
      active: activeEpaper,
      latest: latestEpaper
        ? {
            id: String(latestEpaper._id),
            title: latestEpaper.title,
            editionDate: latestEpaper.editionDate,
            pageCount: latestEpaper.pageCount,
            coverImageUrl: latestEpaper.coverImageUrl || "",
          }
        : null,
    },
    categories: { total: categories, active: activeCategories },
    cities: { total: cities, active: activeCities },
    staticPages: { total: staticPages, active: activeStaticPages },
  };
};

const getSubmissionStats = async () => {
  const [
    newsTips,
    newsTipsNew,
    reporterApplications,
    reporterApplicationsNew,
    adInquiries,
    adInquiriesNew,
    contactMessages,
    contactMessagesNew,
    recentNewsTips,
    recentReporterApplications,
    recentAdInquiries,
    recentContactMessages,
  ] = await Promise.all([
    NewsTip.countDocuments(),
    NewsTip.countDocuments({ status: "NEW" }),
    ReporterApplication.countDocuments(),
    ReporterApplication.countDocuments({ status: "NEW" }),
    AdInquiry.countDocuments(),
    AdInquiry.countDocuments({ status: "NEW" }),
    ContactMessage.countDocuments(),
    ContactMessage.countDocuments({ status: "NEW" }),
    NewsTip.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("subject description name status createdAt")
      .lean(),
    ReporterApplication.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("fullName email city status createdAt")
      .lean(),
    AdInquiry.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name company adType status createdAt")
      .lean(),
    ContactMessage.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name subject message status createdAt")
      .lean(),
  ]);

  const recent = [
    ...recentNewsTips.map((item) => ({
      type: "newsTip",
      label: "News Tip",
      id: String(item._id),
      title: item.subject || item.description?.slice(0, 80) || "Untitled tip",
      name: item.name || "Anonymous",
      status: item.status,
      createdAt: item.createdAt,
    })),
    ...recentReporterApplications.map((item) => ({
      type: "reporterApplication",
      label: "Reporter Application",
      id: String(item._id),
      title: item.fullName,
      name: item.email || item.city || "",
      status: item.status,
      createdAt: item.createdAt,
    })),
    ...recentAdInquiries.map((item) => ({
      type: "adInquiry",
      label: "Ad Inquiry",
      id: String(item._id),
      title: item.company || item.name,
      name: item.name,
      status: item.status,
      createdAt: item.createdAt,
    })),
    ...recentContactMessages.map((item) => ({
      type: "contactMessage",
      label: "Contact Message",
      id: String(item._id),
      title: item.subject || item.message?.slice(0, 80) || "Contact message",
      name: item.name,
      status: item.status,
      createdAt: item.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return {
    summary: {
      newsTips: { total: newsTips, newCount: newsTipsNew },
      reporterApplications: {
        total: reporterApplications,
        newCount: reporterApplicationsNew,
      },
      adInquiries: { total: adInquiries, newCount: adInquiriesNew },
      contactMessages: { total: contactMessages, newCount: contactMessagesNew },
      newTotal:
        newsTipsNew + reporterApplicationsNew + adInquiriesNew + contactMessagesNew,
    },
    recent,
  };
};

const getUserRoleStats = async ({ rangeFrom, rangeTo }) => {
  const [users, activeUsers, newUsers, roles, activeRoles] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ createdAt: { $gte: rangeFrom, $lte: rangeTo } }),
    Role.countDocuments(),
    Role.countDocuments({ isActive: true }),
  ]);
  return {
    users: { total: users, active: activeUsers, newInRange: newUsers },
    roles: { total: roles, active: activeRoles },
  };
};

const getEditorialWidgets = async () => {
  const articleFields =
    "title featuredImage status publishedAt createdAt isBreaking isFeatured stats.views stats.likes stats.comments";

  const [drafts, recentArticles, topArticles] = await Promise.all([
    Article.find({ status: "DRAFT" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select(articleFields)
      .populate("category", "name")
      .populate("author", "name")
      .lean(),
    Article.find({ status: "PUBLISHED" })
      .sort({ publishedAt: -1 })
      .limit(5)
      .select(articleFields)
      .populate("category", "name")
      .populate("author", "name")
      .lean(),
    Article.find({ status: "PUBLISHED" })
      .sort({ "stats.views": -1 })
      .limit(5)
      .select(articleFields)
      .populate("category", "name")
      .populate("author", "name")
      .lean(),
  ]);

  return {
    draftCount: await Article.countDocuments({ status: "DRAFT" }),
    drafts: drafts.map(mapArticle),
    recentArticles: recentArticles.map(mapArticle),
    topArticles: topArticles.map(mapArticle),
  };
};

const getSeries = async ({ rangeFrom, rangeTo, keys }) => {
  const [articlesByDay, adClicksByDay, pollVotesByDay] = await Promise.all([
    Article.aggregate([
      { $match: { status: "PUBLISHED", publishedAt: { $gte: rangeFrom, $lte: rangeTo } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$publishedAt",
              timezone: IST_TZ,
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    dailySeries(AdClick, "clickedAt", rangeFrom, rangeTo, "clicks"),
    dailySeries(PollVote, "createdAt", rangeFrom, rangeTo, "votes"),
  ]);

  return {
    articlesPublishedByDay: fillSeries(articlesByDay, keys, "count"),
    adClicksByDay: fillSeries(adClicksByDay, keys, "clicks"),
    pollVotesByDay: fillSeries(pollVotesByDay, keys, "votes"),
  };
};

const buildAlerts = ({ articles, submissions, ads, polls, library }) => {
  const alerts = [];
  if (articles.draft > 0) {
    alerts.push({
      level: "info",
      code: "DRAFTS_PENDING",
      message: `${articles.draft} draft article${articles.draft === 1 ? "" : "s"} awaiting review`,
      count: articles.draft,
    });
  }
  if (submissions.summary.newTotal > 0) {
    alerts.push({
      level: "warning",
      code: "NEW_SUBMISSIONS",
      message: `${submissions.summary.newTotal} new submission${submissions.summary.newTotal === 1 ? "" : "s"} in the inbox`,
      count: submissions.summary.newTotal,
    });
  }
  if (ads.endingSoon.length > 0) {
    alerts.push({
      level: "warning",
      code: "ADS_ENDING_SOON",
      message: `${ads.endingSoon.length} ad campaign${ads.endingSoon.length === 1 ? "" : "s"} ending within 7 days`,
      count: ads.endingSoon.length,
    });
  }
  if (polls.active === 0) {
    alerts.push({
      level: "info",
      code: "NO_ACTIVE_POLL",
      message: "No active reader poll",
      count: 0,
    });
  }
  if (library.epaper.active === 0) {
    alerts.push({
      level: "info",
      code: "NO_ACTIVE_EPAPER",
      message: "No active e-paper edition",
      count: 0,
    });
  }
  return alerts;
};

const getDashboardOverview = async ({ range = "30d" } = {}) => {
  const days = RANGE_DAYS[range] || RANGE_DAYS["30d"];
  const now = new Date();
  const todayStart = istDayStart(now);
  const rangeFrom = new Date(todayStart.getTime() - (days - 1) * DAY_MS);
  const rangeTo = now;
  const soon = new Date(now.getTime() + 7 * DAY_MS);
  const keys = buildDayKeys(rangeFrom, days);

  const [
    articles,
    liveNews,
    notices,
    ads,
    polls,
    qotd,
    library,
    submissions,
    usersRoles,
    editorial,
    series,
  ] = await Promise.all([
    getArticleStats({ todayStart, rangeFrom, rangeTo }),
    getLiveNewsStats(),
    getNoticeStats(),
    getAdsStats({ rangeFrom, rangeTo, now, soon }),
    getPollStats(),
    getQotdStats(),
    getLibraryStats(),
    getSubmissionStats(),
    getUserRoleStats({ rangeFrom, rangeTo }),
    getEditorialWidgets(),
    getSeries({ rangeFrom, rangeTo, keys }),
  ]);

  return {
    meta: {
      generatedAt: now.toISOString(),
      range: {
        key: range,
        days,
        from: rangeFrom.toISOString(),
        to: rangeTo.toISOString(),
        timezone: IST_TZ,
      },
    },
    summary: {
      articles: {
        total: articles.total,
        published: articles.published,
        draft: articles.draft,
        publishedToday: articles.publishedToday,
        publishedInRange: articles.publishedInRange,
      },
      engagement: articles.engagement,
      liveNews,
      notices,
      ads: ads.summary,
      polls,
      qotd,
      library,
      submissions: submissions.summary,
      users: usersRoles.users,
      roles: usersRoles.roles,
    },
    series,
    editorialQueue: {
      draftCount: editorial.draftCount,
      drafts: editorial.drafts,
    },
    recentArticles: editorial.recentArticles,
    topArticles: editorial.topArticles,
    ads: {
      topCampaigns: ads.topCampaigns,
      endingSoon: ads.endingSoon,
    },
    submissions: {
      counts: submissions.summary,
      recent: submissions.recent,
    },
    alerts: buildAlerts({
      articles,
      submissions,
      ads,
      polls,
      library,
    }),
  };
};

module.exports = { getDashboardOverview };
