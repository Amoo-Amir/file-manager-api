const express = require("express");
const authcontroller = require("../controllers/auth.controller");
const {
  registerSchema,
  loginSchema,
} = require("../validations/auth.validation");
const validate = require("../middlewares/validate.middleware");

const route = express.Router();

route.post("/auth/register", validate(registerSchema), authcontroller.Register);
route.post("/auth/login", validate(loginSchema), authcontroller.Login);

module.exports = route;
