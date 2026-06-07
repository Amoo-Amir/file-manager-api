const asyncHandler = require("../middlewares/asyncHandler");
const fileService = require("../services/file.service");
const ApiError = require("../utils/apiError");
const fs = require("fs");

const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError("No file provided", 400, "NO_FILE");
  }
  const result = await fileService.uploadFile(req.userId, req.file);
  res.status(201).json(result);
});

const getFiles = asyncHandler(async (req, res) => {
  const result = await fileService.getFiles(req.userId, req.query);
  res.status(200).json(result);
});

const deleteFile = asyncHandler(async (req, res) => {
  const result = await fileService.deleteFile(req.userId, req.params.id);
  res.status(200).json(result);
});

const downloadFile = asyncHandler(async (req, res) => {
  const { absolutePath, originalName, mimetype } = await fileService.downloadFile(
    req.userId,
    req.params.id
  );

  res.setHeader("Content-Disposition", `attachment; filename="${originalName}"`);
  res.setHeader("Content-Type", mimetype);

  const stream = fs.createReadStream(absolutePath);
  stream.pipe(res);

  stream.on("error", () => {
    throw new ApiError("Failed to stream file", 500, "STREAM_ERROR");
  });
});

module.exports = { uploadFile, getFiles,deleteFile,downloadFile };