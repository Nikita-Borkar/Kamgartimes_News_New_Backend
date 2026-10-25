const publicArticleService = require("../services/publicArticleService");
const successResponse = require("../errors/responses/successResponse");

const list = async (req, res, next) => {
  try {
    const result = await publicArticleService.listPublishedArticles(req.validatedQuery);
    return res
      .status(200)
      .json(new successResponse(200, "Articles fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const getBySlug = async (req, res, next) => {
  try {
    const article = await publicArticleService.getPublishedArticleBySlug(req.params.slug);
    return res
      .status(200)
      .json(new successResponse(200, "Article fetched successfully", article));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const article = await publicArticleService.getPublishedArticle(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Article fetched successfully", article));
  } catch (err) {
    next(err);
  }
};

const related = async (req, res, next) => {
  try {
    const articles = await publicArticleService.getRelatedArticles(
      req.params.id,
      req.validatedQuery,
    );
    return res
      .status(200)
      .json(new successResponse(200, "Related articles fetched successfully", { articles }));
  } catch (err) {
    next(err);
  }
};

const view = async (req, res, next) => {
  try {
    const result = await publicArticleService.incrementStat(req.params.id, "view");
    return res.status(200).json(new successResponse(200, "View recorded", result));
  } catch (err) {
    next(err);
  }
};

const share = async (req, res, next) => {
  try {
    const result = await publicArticleService.incrementStat(req.params.id, "share");
    return res.status(200).json(new successResponse(200, "Share recorded", result));
  } catch (err) {
    next(err);
  }
};

const click = async (req, res, next) => {
  try {
    const result = await publicArticleService.incrementStat(req.params.id, "click");
    return res
      .status(200)
      .json(new successResponse(200, "Link click recorded", result));
  } catch (err) {
    next(err);
  }
};

const reactions = async (req, res, next) => {
  try {
    const result = await publicArticleService.getReactions(
      req.params.id,
      req.user?.userId || null,
    );
    return res
      .status(200)
      .json(new successResponse(200, "Reactions fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const toggleReaction = async (req, res, next) => {
  try {
    const result = await publicArticleService.toggleReaction(
      req.params.id,
      req.user.userId,
      req.validatedBody.type,
    );
    return res
      .status(200)
      .json(new successResponse(200, "Reaction updated successfully", result));
  } catch (err) {
    next(err);
  }
};

const listComments = async (req, res, next) => {
  try {
    const result = await publicArticleService.listComments(req.params.id, req.query);
    return res
      .status(200)
      .json(new successResponse(200, "Comments fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const createComment = async (req, res, next) => {
  try {
    const comment = await publicArticleService.createComment(
      req.params.id,
      req.user.userId,
      req.validatedBody,
    );
    return res
      .status(201)
      .json(new successResponse(201, "Comment added successfully", comment));
  } catch (err) {
    next(err);
  }
};

const ticker = async (req, res, next) => {
  try {
    const articles = await publicArticleService.listLatestNewsTicker(
      req.validatedQuery
    );
    return res
      .status(200)
      .json(
        new successResponse(
          200,
          "Latest news ticker fetched successfully",
          articles
        )
      );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  getBySlug,
  getById,
  related,
  view,
  share,
  click,
  reactions,
  toggleReaction,
  listComments,
  createComment,
  ticker,
};
