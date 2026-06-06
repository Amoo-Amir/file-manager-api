const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const apiError = require("../utils/apiError");

const register = async (data) => {
  const { email, fullName, password, phone } = data;

  const normalizedEmail = String(email).toLowerCase().trim();

  if (!email || !fullName || !password || !phone) {
    throw new apiError("Missing required fields", 400);
  }

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

module.exports = {
  register,
  Login,
};
