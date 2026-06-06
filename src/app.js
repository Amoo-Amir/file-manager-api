const express = require("express");

const authRoute = require("./routes/auth.routes");
const userRoutes  = require("./routes/user.routes");
const errorHandler = require("./middlewares/error.middleware")
const app = express();

app.use(express.json());

// Routes
app.use("/api", authRoute);
app.use("/api/user",userRoutes  );
console.log("USER ROUTES LOADED");

app.use(errorHandler);


module.exports = app;
