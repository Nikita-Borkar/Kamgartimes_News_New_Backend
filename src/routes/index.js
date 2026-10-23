const express = require("express");
const router = express.Router();

const authRoutes = require("./v1/auth.route");
const healthRoutes = require("./v1/health.route");
const roleRoutes = require("./v1/role.route");
const userRoutes = require("./v1/user.route");
const categoryRoutes = require("./v1/category.route");
const articleRoutes = require("./v1/article.route");
const publicArticleRoutes = require("./v1/publicArticle.route");
const imageMediaRoutes = require("./v1/imageMedia.route");
const videoMediaRoutes = require("./v1/videoMedia.route");
const publicMediaRoutes = require("./v1/publicMedia.route");
const noticeRoutes = require("./v1/notice.route");
const publicNoticeRoutes = require("./v1/publicNotice.route");
const adSlotRoutes = require("./v1/adSlot.route");
const adCampaignRoutes = require("./v1/adCampaign.route");
const adPlacementRoutes = require("./v1/adPlacement.route");
const adStatsRoutes = require("./v1/adStats.route");
const publicAdRoutes = require("./v1/publicAd.route");
const siteSettingRoutes = require("./v1/siteSetting.route");
const staticPageRoutes = require("./v1/staticPage.route");
const questionOfTheDayRoutes = require("./v1/questionOfTheDay.route");
const publicSiteSettingRoutes = require("./v1/publicSiteSetting.route");
const publicStaticPageRoutes = require("./v1/publicStaticPage.route");
const publicQuestionOfTheDayRoutes = require("./v1/publicQuestionOfTheDay.route");
const publicHomeRoutes = require("./v1/publicHome.route");
const publicCategoryRoutes = require("./v1/publicCategory.route");
const cityRoutes = require("./v1/city.route");
const publicCityRoutes = require("./v1/publicCity.route");
const galleryRoutes = require("./v1/gallery.route");
const publicGalleryRoutes = require("./v1/publicGallery.route");
const epaperRoutes = require("./v1/epaper.route");
const publicEpaperRoutes = require("./v1/publicEpaper.route");
const pollRoutes = require("./v1/poll.route");
const publicPollRoutes = require("./v1/publicPoll.route");
const submissionRoutes = require("./v1/submission.route");

router.use("/auth", authRoutes);
router.use("/health", healthRoutes);
router.use("/roles", roleRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/articles", articleRoutes);
router.use("/public/articles", publicArticleRoutes);
router.use("/media/images", imageMediaRoutes);
router.use("/media/videos", videoMediaRoutes);
router.use("/public/media", publicMediaRoutes);
router.use("/notices", noticeRoutes);
router.use("/public/notices", publicNoticeRoutes);
router.use("/ad-slots", adSlotRoutes);
router.use("/ad-campaigns", adCampaignRoutes);
router.use("/ad-placements", adPlacementRoutes);
router.use("/ad-stats", adStatsRoutes);
router.use("/public/ads", publicAdRoutes);
router.use("/site-setting", siteSettingRoutes);
router.use("/static-pages", staticPageRoutes);
router.use("/question-of-the-day", questionOfTheDayRoutes);
router.use("/public/site-setting", publicSiteSettingRoutes);
router.use("/public/static-pages", publicStaticPageRoutes);
router.use("/public/question-of-the-day", publicQuestionOfTheDayRoutes);
router.use("/public/home", publicHomeRoutes);
router.use("/public/categories", publicCategoryRoutes);
router.use("/public/cities", publicCityRoutes);
router.use("/public/galleries", publicGalleryRoutes);
router.use("/public/epaper", publicEpaperRoutes);
router.use("/public/polls", publicPollRoutes);
router.use("/cities", cityRoutes);
router.use("/galleries", galleryRoutes);
router.use("/epaper", epaperRoutes);
router.use("/polls", pollRoutes);
router.use("/public/submissions/news-tips", submissionRoutes.newsTips.publicRouter);
router.use(
  "/public/submissions/reporter-applications",
  submissionRoutes.reporterApplications.publicRouter,
);
router.use("/public/submissions/ad-inquiries", submissionRoutes.adInquiries.publicRouter);
router.use(
  "/public/submissions/contact-messages",
  submissionRoutes.contactMessages.publicRouter,
);
router.use("/news-tips", submissionRoutes.newsTips.adminRouter);
router.use("/reporter-applications", submissionRoutes.reporterApplications.adminRouter);
router.use("/ad-inquiries", submissionRoutes.adInquiries.adminRouter);
router.use("/contact-messages", submissionRoutes.contactMessages.adminRouter);

module.exports = router;
