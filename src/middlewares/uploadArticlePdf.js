const multer = require("multer");
const BadRequestError = require("../errors/customErrors/BadRequestError");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isPdfName = file.originalname?.toLowerCase().endsWith(".pdf");
    const isPdfType = file.mimetype === "application/pdf" || file.mimetype === "application/octet-stream";
    if (!isPdfName || !isPdfType) {
      return cb(new BadRequestError("Only PDF files are allowed"));
    }
    cb(null, true);
  },
}).single("file");

const uploadArticlePdf = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return next(new BadRequestError("PDF too large (max 20 MB)"));
      }
      if (err instanceof multer.MulterError) return next(new BadRequestError(err.message));
      return next(err);
    }
    next();
  });
};

module.exports = uploadArticlePdf;
