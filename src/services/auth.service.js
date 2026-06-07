const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const apiError = require("../utils/apiError");

const register = async (data) => {
  const { email, fullName, password, phone } = data;

  if (!email || !fullName || !password || !phone) {
    throw new apiError("Missing required fields", 400);
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  const userExists = await User.findOne({
    email: normalizedEmail,
  });

  if (userExists) {
    throw new apiError("User already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = new User({
    fullName,
    email: normalizedEmail,
    password: hashedPassword,
    phone,
  });

  const savedUser = await user.save();

  return {
    success: true,
    message: "User created successfully",
    data: {
      id: savedUser._id,
      fullName: savedUser.fullName,
      email: savedUser.email,
      phone: savedUser.phone,
    },
  };
};

const Login = async (data) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new apiError(
      "Email and password are required",
      400,
      "VALIDATION_ERROR",
      {
        email: !email ? "Email is required" : undefined,
        password: !password ? "Password is required" : undefined,
      },
    );
  }

  const normallemail = String(email).toLowerCase().trim();

  const userExists = await User.findOne({
    email: normallemail,
  }).select("+password");

  if (!userExists) {
    throw new apiError("User not found", 404, "USER_NOT_FOUND");
  }

  const isPasswordValid = await bcrypt.compare(password, userExists.password);
  if (!isPasswordValid) {
    throw new apiError("Email or password is incorrect", 401);
  }

  const token = jwt.sign(
    {
      userId: userExists._id,
      userRole: userExists.role,
      email: userExists.email,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );

  const userResponse = {
    _id: userExists._id,
    fullName: userExists.fullName,
    email: userExists.email,
    role: userExists.role,
  };

  return {
    success: true,
    message: "Login successful",
    token,
    user: userResponse,
  };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new apiError("User not found", 404, "USER_NOT_FOUND");
  }
  return {
    success: true,
    message: "Profile retrieved successfully",
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
    },
  };
};

const updateProfile = async (userId, data) => {
  const { fullName, phone } = data;

  if (!fullName || !phone) {
    throw new apiError(
      "Full name and phone are required",
      400,
      "VALIDATION_ERROR",
    );
  }

  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new apiError("User not found", 404, "USER_NOT_FOUND");
  }

  if (fullName) {
    user.fullName = fullName;
  }
  if (phone) {
    user.phone = phone;
  }

  await user.save();

  return {
    success: true,
    message: "Profile updated successfully",
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};

const deleteAccount = async (userId, data) => {
  // const userId = userId;
  const { email, password } = data;

  const normalaizeEmail = String(email).toLowerCase().trim();

  if (!email || !password) {
    throw new apiError(
      "Email and password are required",
      400,
      "VALIDATION_ERROR",
    );
  }

  const user = await User.findOne({
    email: normalaizeEmail,
  }).select("+password");
  if (!user) {
    throw new apiError("User not found", 404, "USER_NOT_FOUND");
  }

  if (userId?.toString() !== user._id.toString()) {
    throw new apiError(
      "You are not allowed to delete this account",
      403,
      "FORBIDDEN",
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new apiError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  await User.findByIdAndDelete(userId);

  return {
    success: true,
    message: "Account deleted successfully",
  };
};

const changePassword = async (userId, data) => {
  const { OldPass, NewPass, ConfrimNewPass } = data;

  if (!OldPass || !NewPass || !ConfrimNewPass) {
    throw new apiError("All fields are required", 400, "VALIDATION_ERROR");
  }

  if (NewPass !== ConfrimNewPass) {
    throw new apiError("Passwords do not match", 400, "PASSWORD_MISMATCH");
  }

  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new apiError("User not found", 404, "USER_NOT_FOUND");
  }

  const isMatch = await bcrypt.compare(OldPass, user.password);
  if (!isMatch) {
    throw new apiError(
      "Old password is incorrect",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  const HashNewPassword = await bcrypt.hash(NewPass, 12);
  user.password = HashNewPassword;
  await user.save();

  return {
    success: true,
    message: "Your password has been updated successfully",
  };
};

module.exports = {
  register,
  Login,
  getProfile,
  updateProfile,
  deleteAccount,
  changePassword,
};