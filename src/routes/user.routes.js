const express = require("express");
const userController = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");

const app = express.Router();

app.get("/user/profile", auth, userController.getProfile);

app.patch("/user/update", auth, userController.updateProfile);

app.patch("/user/changepassword", auth, userController.changePassword);
app.delete("/user/delete", userController.deleteAccount);

module.exports= app