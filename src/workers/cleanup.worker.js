const fs = require("fs");
const path = require("path");
const File = require("../models/file.model");
const logger = require("../utils/logger");

// فایل‌هایی که بیشتر از RETENTION_DAYS روز پیش حذف شدن رو از disk پاک کن
const RETENTION_DAYS = 7;

const cleanupDeletedFiles = async () => {
  logger.info("Cleanup worker started");

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  // فایل‌هایی که isDeleted: true و deletedAt قدیمی‌تر از cutoff هستن
  // چون pre(/^find/) رو حذف کردیم، باید مستقیم query بزنیم
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
      // حذف از disk
      const absolutePath = path.resolve(file.path);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }

      // حذف از DB
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