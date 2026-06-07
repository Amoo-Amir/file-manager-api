const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const ApiError = require("../utils/apiError");

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "text/plain": "txt",
  "application/zip": "zip",
};

const MAX_SIZE = 10 * 1024 * 1024; // 10MB


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {

    const ext = ALLOWED_TYPES[file.mimetype];
    const randomName = crypto.randomBytes(16).toString("hex");
    cb(null, `${randomName}.${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES[file.mimetype]) {
    cb(null, true);   
  } else {
    cb(
      new ApiError(
        `File type not allowed. Allowed types: ${Object.keys(ALLOWED_TYPES).join(", ")}`,
        400,
        "INVALID_FILE_TYPE"
      ),
      false           
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE,
    files: 1,         
  },
});

module.exports = upload;