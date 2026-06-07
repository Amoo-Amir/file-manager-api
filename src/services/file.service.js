const File = require("../models/file.model");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");
const path = require("path");
const fs = require("fs");

const formatFile = (file) => ({
  id: file._id,
  originalName: file.originalName,
  filename: file.filename,
  size: file.size,
  mimetype: file.mimetype,
  category: file.category,
  createdAt: file.createdAt,
});

const uploadFile = async (userId, file) => {
  const newFile = await File.create({
    owner: userId,
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size,
  });

  logger.info("File saved to DB", { fileId: newFile._id, owner: userId });

  return {
    success: true,
    message: "File uploaded successfully",
    data: formatFile(newFile),
  };
};

const getFiles = async (userId, query) => {
  const { page = 1, limit = 10, category, sort = "newest" } = query;

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

const filter = { owner: userId, isDeleted: false };

  if (category) {
    const allowed = ["image", "document", "archive", "other"];
    if (!allowed.includes(category)) {
      throw new ApiError(
        `Invalid category. Allowed: ${allowed.join(", ")}`,
        400,
        "INVALID_CATEGORY",
      );
    }
    filter.category = category;
  }

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    largest: { size: -1 },
    smallest: { size: 1 },
  };
  const sortQuery = sortMap[sort] || sortMap.newest;

  const [files, total] = await Promise.all([
    File.find(filter).sort(sortQuery).skip(skip).limit(limitNum),
    File.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return {
    success: true,
    message: "Files retrieved successfully",
    data: files.map(formatFile),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
};

// src/services/file.service.js

const deleteFile = async (userId, fileId) => {
  // ✅ isDeleted: false رو صریح بنویس
  const file = await File.findOne({ _id: fileId, owner: userId, isDeleted: false });
  if (!file) {
    throw new ApiError("File not found", 404, "FILE_NOT_FOUND");
  }
  await file.softDelete();
  logger.info("File soft deleted", { fileId, owner: userId });
  return { success: true, message: "File deleted successfully" };
};

const downloadFile = async (userId, fileId) => {
  // ✅ isDeleted: false رو صریح بنویس
  const file = await File.findOne({ _id: fileId, owner: userId, isDeleted: false });
  if (!file) {
    throw new ApiError("File not found", 404, "FILE_NOT_FOUND");
  }
  const absolutePath = path.resolve(file.path);
  if (!fs.existsSync(absolutePath)) {
    throw new ApiError("File not found on server", 404, "FILE_MISSING_ON_DISK");
  }
  return { absolutePath, originalName: file.originalName, mimetype: file.mimetype };
};


module.exports = { uploadFile, getFiles, deleteFile, downloadFile };
