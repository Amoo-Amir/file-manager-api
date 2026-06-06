const app = require("./app");
const env = require("./config/env");
const DB = require("./config/db");

const startServer = async () => {
  try {
    await DB();

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
