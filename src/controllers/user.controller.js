const User = require("../models/user.model");
const asyncHandler = require("../../src/middlewares/asyncHandler.js");
const bcrypt = require("bcrypt");
const authService = require("../services/auth.service.js");

const getProfile = asyncHandler(async (res, req) => {
  const result = await authService.getProfile(req.body);

  res.status(200).json(result);
});

const updateProfile = asyncHandler(async (req, res) => {
  const result = await authService.updateProfile(req.body);

  res.status(200).json(result);
});

const deleteAccount = asyncHandler(async (req, res) => {
  const result = await authService.deleteAccount(req.body);

  res.status(200).json(result);
});

const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.body);

  res.status(200).json(result);
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};
