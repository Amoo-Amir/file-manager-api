const User = require("../models/user.model");
const asyncHandler = require("../middlewares/asyncHandler");
const bcrypt = require("bcrypt");

const getProfile = asyncHandler(async (res, req) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      errorCode: "USER_NOT_FOUND",
    });
  }
  res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
    },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({
      success: false,
      message: "Full name and phone are required",
      errorCode: "VALIDATION_ERROR",
    });
  }

  const user = await User.findById(req.userId).select("-password");
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      errorCode: "USER_NOT_FOUND",
    });
  }

  if (fullName) {
    user.fullName = fullName;
  }
  if (phone) {
    user.phone = phone;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { email, password } = req.body;

  const normalaizeEmail = String(email).toLowerCase().trim();

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        errorCode: "VALIDATION_ERROR",
      });
    }

    const user = await User.findOne({
      email: normalaizeEmail,
    }).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errorCode: "USER_NOT_FOUND",
      });
    }

    if (userId?.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this account",
        errorCode: "FORBIDDEN",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        errorCode: "INVALID_CREDENTIALS",
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

const changePassword = asynchandler(async (req, res) => {
  const { OldPass, NewPass, ConfrimNewPass } = req.body;
  const userId = req.userId;
  try {
    if (!OldPass || !NewPass || !ConfrimNewPass) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        errorCode: "VALIDATION_ERROR",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
        errorCode: "PASSWORD_MISMATCH",
      });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errorCode: "USER_NOT_FOUND",
      });
    }

    const isMatch = await bcrypt.compare(OldPass, user.password);
    if (!isMatch) {
      return res.status().json({
        success: false,
        message: "Old password is incorrect",
        errorCode: "INVALID_CREDENTIALS",
      });
    }

    const HashNewPassword = await bcrypt.hash(NewPass, 12);

    user.password = HashNewPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Your password has been updated successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};
