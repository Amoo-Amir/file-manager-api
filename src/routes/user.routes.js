const express = require("express");
const userController = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");

const router = express.Router();



router.get("/profile", auth, userController.getProfile);
console.log("USER ROUTES FILE LOADED");
router.patch("/update", auth, userController.updateProfile);

router.patch("/changepassword", auth, userController.changePassword);
router.delete("/delete",auth, userController.deleteAccount);


module.exports= router;