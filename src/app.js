const express = require("express");

const authRoute = require("./routes/auth.routes");
const userRoute = require("./routes/user.routes");

const app = express();

app.use(express.json());

// Routes
app.use("/api", authRoute);
app.use("/api", userRoute);

module.exports = app;
