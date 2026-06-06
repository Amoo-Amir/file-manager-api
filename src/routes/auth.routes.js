const express = require("express");
const authcontroller = require("../controllers/auth.controller");

const route = express.Router();

route.post("/auth/register", authcontroller.Register);
route.post("/auth/login", authcontroller.Login);

module.exports = route;
