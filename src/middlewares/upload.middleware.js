const upload = require("../config/multer");
const ApiError = require("../utils/apiError");

const uploadMiddleware = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return next(new ApiError("File size exceeds 10MB limit", 400, "FILE_TOO_LARGE"));
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return next(new ApiError("Only one file allowed per request", 400, "TOO_MANY_FILES"));
    }

    if (err instanceof ApiError) {
      return next(err);
    }

    return next(new ApiError("File upload failed", 500, "UPLOAD_ERROR"));
  });
};

module.exports = uploadMiddleware;