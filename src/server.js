const app = require("./app");
const env = require("./config/env");
const DB = require("./config/db");
const fs = require("fs");

const logger = require("./utils/logger");
const { cleanupDeletedFiles } = require("./workers/cleanup.worker");

const CLEANUP_INTERVAL_HOURS = 24; 

const startServer = async () => {
  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
    logger.info("uploads/ directory created");
  }
  try {
    await DB();

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });

    await cleanupDeletedFiles();
    setInterval(cleanupDeletedFiles, CLEANUP_INTERVAL_HOURS * 60 * 60 * 1000);

    logger.info(`Cleanup worker scheduled every ${CLEANUP_INTERVAL_HOURS}h`);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

startServer();
