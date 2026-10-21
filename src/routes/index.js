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

module.exports = router;
