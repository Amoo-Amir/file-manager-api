const express = require("express");
const userController = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");

const validate = require("../middlewares/validate.middleware");
const {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} = require("../validations/user.validation");

const router = express.Router();

router.get("/profile", auth, userController.getProfile);

router.patch(
  "/update",
  auth,
  validate(updateProfileSchema),
  userController.updateProfile,
);
router.patch(
  "/changepassword",
  auth,
  validate(changePasswordSchema),
  userController.changePassword,
);

router.delete(
  "/delete",
  validate(deleteAccountSchema),
  auth,
  userController.deleteAccount,
);

module.exports = router;
