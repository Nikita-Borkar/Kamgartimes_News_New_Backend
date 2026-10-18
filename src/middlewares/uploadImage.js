const multer = require("multer");
const BadRequestError = require("../errors/customErrors/BadRequestError");

// Images are kept in memory and streamed to Cloudinary by the service —
// no temp files on disk.
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new BadRequestError("Only image files are allowed"));
    }
    cb(null, true);
  },
}).single("image");

// Wraps multer so its errors surface as clean 400s instead of 500s.
const uploadImage = (req, res, next) => {
  imageUpload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new BadRequestError("Image too large (max 10 MB)"));
        }
        return next(new BadRequestError(err.message));
      }
      return next(err);
    }
    next();
  });
};

module.exports = uploadImage;
