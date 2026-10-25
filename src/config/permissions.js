const PERMISSIONS = {
  // Admin dashboard overview
  DASHBOARD_READ: "dashboard:read",

  // User management
  USER_READ: "user:read",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  USER_ASSIGN_ROLE: "user:assign_role",

  // Role management
  ROLE_READ: "role:read",
  ROLE_CREATE: "role:create",
  ROLE_UPDATE: "role:update",
  ROLE_DELETE: "role:delete",

  // Categories
  CATEGORY_READ: "category:read",
  CATEGORY_CREATE: "category:create",
  CATEGORY_UPDATE: "category:update",
  CATEGORY_DELETE: "category:delete",

  // Articles / news content
  ARTICLE_READ: "article:read",
  ARTICLE_CREATE: "article:create",
  ARTICLE_UPDATE: "article:update",
  ARTICLE_DELETE: "article:delete",
  ARTICLE_PUBLISH: "article:publish",

  // Reader comments (moderation on the public site)
  COMMENT_MODERATE: "comment:moderate",

  // Notices (reader-site ticker)
  NOTICE_READ: "notice:read",
  NOTICE_CREATE: "notice:create",
  NOTICE_UPDATE: "notice:update",
  NOTICE_DELETE: "notice:delete",

  // Ads (slots, campaigns, placements, stats)
  AD_READ: "ad:read",
  AD_CREATE: "ad:create",
  AD_UPDATE: "ad:update",
  AD_DELETE: "ad:delete",

  // Site settings (logo, tagline, social links)
  SETTING_READ: "setting:read",
  SETTING_UPDATE: "setting:update",

  // Static pages (About Us, Contact Us, etc.)
  STATIC_PAGE_READ: "staticPage:read",
  STATIC_PAGE_CREATE: "staticPage:create",
  STATIC_PAGE_UPDATE: "staticPage:update",
  STATIC_PAGE_DELETE: "staticPage:delete",

  // Question of the Day
  QOTD_READ: "qotd:read",
  QOTD_CREATE: "qotd:create",
  QOTD_UPDATE: "qotd:update",
  QOTD_DELETE: "qotd:delete",

  // Media library (images & videos)
  MEDIA_READ: "media:read",
  MEDIA_CREATE: "media:create",
  MEDIA_UPDATE: "media:update",
  MEDIA_DELETE: "media:delete",

  // Cities (hyperlocal sections)
  CITY_READ: "city:read",
  CITY_CREATE: "city:create",
  CITY_UPDATE: "city:update",
  CITY_DELETE: "city:delete",

  // Photo galleries
  GALLERY_READ: "gallery:read",
  GALLERY_CREATE: "gallery:create",
  GALLERY_UPDATE: "gallery:update",
  GALLERY_DELETE: "gallery:delete",

  // E-paper editions
  EPAPER_READ: "epaper:read",
  EPAPER_CREATE: "epaper:create",
  EPAPER_UPDATE: "epaper:update",
  EPAPER_DELETE: "epaper:delete",

  // Reader polls
  POLL_READ: "poll:read",
  POLL_CREATE: "poll:create",
  POLL_UPDATE: "poll:update",
  POLL_DELETE: "poll:delete",

  // Public submissions inbox (tips, reporter applications, ad leads, contact)
  SUBMISSION_READ: "submission:read",
  SUBMISSION_UPDATE: "submission:update",

  // Live News (breaking live stories shown on reader site)
  LIVE_NEWS_READ: "liveNews:read",
  LIVE_NEWS_CREATE: "liveNews:create",
  LIVE_NEWS_UPDATE: "liveNews:update",
  LIVE_NEWS_DELETE: "liveNews:delete",
};

// Grouped view used by the API/frontend so the UI can render
// checkboxes per section instead of one long flat list.
const PERMISSION_GROUPS = [
  {
    resource: "dashboard",
    label: "Dashboard",
    permissions: [PERMISSIONS.DASHBOARD_READ],
  },
  {
    resource: "user",
    label: "Users",
    permissions: [
      PERMISSIONS.USER_READ,
      PERMISSIONS.USER_UPDATE,
      PERMISSIONS.USER_DELETE,
      PERMISSIONS.USER_ASSIGN_ROLE,
    ],
  },
  {
    resource: "role",
    label: "Roles",
    permissions: [
      PERMISSIONS.ROLE_READ,
      PERMISSIONS.ROLE_CREATE,
      PERMISSIONS.ROLE_UPDATE,
      PERMISSIONS.ROLE_DELETE,
    ],
  },
  {
    resource: "category",
    label: "Categories",
    permissions: [
      PERMISSIONS.CATEGORY_READ,
      PERMISSIONS.CATEGORY_CREATE,
      PERMISSIONS.CATEGORY_UPDATE,
      PERMISSIONS.CATEGORY_DELETE,
    ],
  },
  {
    resource: "article",
    label: "Articles",
    permissions: [
      PERMISSIONS.ARTICLE_READ,
      PERMISSIONS.ARTICLE_CREATE,
      PERMISSIONS.ARTICLE_UPDATE,
      PERMISSIONS.ARTICLE_DELETE,
      PERMISSIONS.ARTICLE_PUBLISH,
    ],
  },
  {
    resource: "comment",
    label: "Comments",
    permissions: [PERMISSIONS.COMMENT_MODERATE],
  },
  {
    resource: "media",
    label: "Media",
    permissions: [
      PERMISSIONS.MEDIA_READ,
      PERMISSIONS.MEDIA_CREATE,
      PERMISSIONS.MEDIA_UPDATE,
      PERMISSIONS.MEDIA_DELETE,
    ],
  },
  {
    resource: "notice",
    label: "Notices",
    permissions: [
      PERMISSIONS.NOTICE_READ,
      PERMISSIONS.NOTICE_CREATE,
      PERMISSIONS.NOTICE_UPDATE,
      PERMISSIONS.NOTICE_DELETE,
    ],
  },
  {
    resource: "ad",
    label: "Ads",
    permissions: [
      PERMISSIONS.AD_READ,
      PERMISSIONS.AD_CREATE,
      PERMISSIONS.AD_UPDATE,
      PERMISSIONS.AD_DELETE,
    ],
  },
  {
    resource: "setting",
    label: "Site Settings",
    permissions: [
      PERMISSIONS.SETTING_READ,
      PERMISSIONS.SETTING_UPDATE,
    ],
  },
  {
    resource: "staticPage",
    label: "Static Pages",
    permissions: [
      PERMISSIONS.STATIC_PAGE_READ,
      PERMISSIONS.STATIC_PAGE_CREATE,
      PERMISSIONS.STATIC_PAGE_UPDATE,
      PERMISSIONS.STATIC_PAGE_DELETE,
    ],
  },
  {
    resource: "qotd",
    label: "Question of the Day",
    permissions: [
      PERMISSIONS.QOTD_READ,
      PERMISSIONS.QOTD_CREATE,
      PERMISSIONS.QOTD_UPDATE,
      PERMISSIONS.QOTD_DELETE,
    ],
  },
  {
    resource: "city",
    label: "Cities",
    permissions: [
      PERMISSIONS.CITY_READ,
      PERMISSIONS.CITY_CREATE,
      PERMISSIONS.CITY_UPDATE,
      PERMISSIONS.CITY_DELETE,
    ],
  },
  {
    resource: "gallery",
    label: "Galleries",
    permissions: [
      PERMISSIONS.GALLERY_READ,
      PERMISSIONS.GALLERY_CREATE,
      PERMISSIONS.GALLERY_UPDATE,
      PERMISSIONS.GALLERY_DELETE,
    ],
  },
  {
    resource: "epaper",
    label: "E-paper",
    permissions: [
      PERMISSIONS.EPAPER_READ,
      PERMISSIONS.EPAPER_CREATE,
      PERMISSIONS.EPAPER_UPDATE,
      PERMISSIONS.EPAPER_DELETE,
    ],
  },
  {
    resource: "poll",
    label: "Polls",
    permissions: [
      PERMISSIONS.POLL_READ,
      PERMISSIONS.POLL_CREATE,
      PERMISSIONS.POLL_UPDATE,
      PERMISSIONS.POLL_DELETE,
    ],
  },
  {
    resource: "submission",
    label: "Submissions",
    permissions: [
      PERMISSIONS.SUBMISSION_READ,
      PERMISSIONS.SUBMISSION_UPDATE,
    ],
  },
  {
    resource: "liveNews",
    label: "Live News",
    permissions: [
      PERMISSIONS.LIVE_NEWS_READ,
      PERMISSIONS.LIVE_NEWS_CREATE,
      PERMISSIONS.LIVE_NEWS_UPDATE,
      PERMISSIONS.LIVE_NEWS_DELETE,
    ],
  },
];

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

module.exports = {
  PERMISSIONS,
  PERMISSION_GROUPS,
  ALL_PERMISSIONS,
};
