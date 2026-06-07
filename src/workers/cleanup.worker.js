const fs = require("fs");
const path = require("path");
const File = require("../models/file.model");
const logger = require("../utils/logger");

const RETENTION_DAYS = 7;

const cleanupDeletedFiles = async () => {
  logger.info("Cleanup worker started");

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  
  const expiredFiles = await File.find({
    isDeleted: true,
    deletedAt: { $lt: cutoff },
  });

  if (expiredFiles.length === 0) {
    logger.info("Cleanup worker: no expired files found");
    return;
  }

  logger.info(`Cleanup worker: found ${expiredFiles.length} expired files`);

  let deleted = 0;
  let failed = 0;

  for (const file of expiredFiles) {
    try {
      const absolutePath = path.resolve(file.path);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }

      await File.deleteOne({ _id: file._id });

      deleted++;
      logger.info(`Cleanup: deleted file ${file.filename}`, {
        fileId: file._id,
        owner: file.owner,
      });
    } catch (error) {
      failed++;
      logger.error(`Cleanup: failed to delete file ${file.filename}`, {
        fileId: file._id,
        error: error.message,
      });
    }
  }

  logger.info(`Cleanup worker finished`, { deleted, failed });
};

module.exports = { cleanupDeletedFiles };
