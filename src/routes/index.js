const express = require("express");
const router = express.Router();

const authRoutes = require("./v1/auth.route");
const healthRoutes = require("./v1/health.route");
const roleRoutes = require("./v1/role.route");
const userRoutes = require("./v1/user.route");
const categoryRoutes = require("./v1/category.route");
const articleRoutes = require("./v1/article.route");
const publicArticleRoutes = require("./v1/publicArticle.route");

router.use("/auth", authRoutes);
router.use("/health", healthRoutes);
router.use("/roles", roleRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/articles", articleRoutes);
router.use("/public/articles", publicArticleRoutes);

module.exports = router;
