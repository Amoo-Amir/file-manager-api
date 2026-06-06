const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const asyncHandler = require("../middlewares/asyncHandler");
const env = require("../config/env");

const Register = asyncHandler(async (req, res) => {
  const { email, fullName, password, phone } = req.body;

  const normallizeemail = String(email).toLowerCase().trim();

  const userExists = await User.findOne({
    email: normallizeemail,
  });
  if (userExists) {
    return res.status(409).json({
      success: false,
      message: "User with this email already exists",
      errorCode: "USER_ALREADY_EXISTS",
    });
  }

  if (!email || !fullName || !password || !phone) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
      errorCode: "VALIDATION_ERROR",
      errors: {
        email: !email ? "Email is required" : undefined,
        fullName: !fullName ? "Full name is required" : undefined,
        password: !password ? "Password is required" : undefined,
        phone: !phone ? "Phone is required" : undefined,
      },
    });
  }

  const passhash = await bcrypt.hash(password, 12);
  if (!passhash) {
    return res.status(500).json({
      success: false,
      message: "Failed to hash password",
      errorCode: "PASSWORD_HASH_FAILED",
    });
  }

  const user = new User({
    fullName,
    email: normallizeemail,
    password: passhash,
    phone,
  });

  const sevedData = await user.save();

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: {
      id: sevedData._id,
      fullName: sevedData.fullName,
      email: sevedData.email,
      phone: sevedData.phone,
    },
  });
});

const Login = asyncHandler(async (req,res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
      errorCode: "VALIDATION_ERROR",
      errors: {
        email: !email ? "Email is required" : undefined,
        password: !password ? "Password is required" : undefined,
      },
    });
  }

  const normallemail = String(email).toLowerCase().trim();

  const userExists = await User.findOne({
    email: normallemail,
  }).select("+password");

  if (!userExists) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      errorCode: "USER_NOT_FOUND",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, userExists.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Email or password is incorrect",
    });
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

  return res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: userResponse,
  });
});

module.exports = {
  Register,
  Login,
};
