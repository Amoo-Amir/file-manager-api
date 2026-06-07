const express = require("express");

const authRoute = require("./routes/auth.routes");
const userRoutes  = require("./routes/user.routes");
const errorHandler = require("./middlewares/error.middleware")
const fileRouter = require("./routes/file.routes")

const app = express();

app.use(express.json());

// Routes
app.use("/api", authRoute);
app.use("/api/user",userRoutes  );
app.use("/api/files", fileRouter)

app.use(errorHandler);


module.exports = app;
