const multer = require("multer");
const BadRequestError = require("../errors/customErrors/BadRequestError");

// Ad creatives can be images or videos kept in memory and streamed to Cloudinary
const adMediaMulter = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 60 * 1024 * 1024 }, // 60 MB limit for ad media
  fileFilter: (req, file, cb) => {
    const mime = file.mimetype || "";
    if (!mime.startsWith("image/") && !mime.startsWith("video/")) {
      return cb(new BadRequestError("Only image and video files are allowed for ad creatives"));
    }
    cb(null, true);
  },
}).fields([
  { name: "image", maxCount: 1 },
  { name: "video", maxCount: 1 },
  { name: "media", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

// Wraps multer so its errors surface as clean 400s instead of 500s.
const uploadAdMedia = (req, res, next) => {
  adMediaMulter(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new BadRequestError("Ad media file too large (max 60 MB)"));
        }
        return next(new BadRequestError(err.message));
      }
      return next(err);
    }

    // Normalise req.file so downstream controllers/services have a single handle
    if (req.files) {
      req.file =
        req.files.image?.[0] ||
        req.files.video?.[0] ||
        req.files.media?.[0] ||
        req.files.file?.[0] ||
        null;
    }

    next();
  });
};

module.exports = uploadAdMedia;

