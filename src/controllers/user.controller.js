const asyncHandler = require("../../src/middlewares/asyncHandler.js");
const authService = require("../services/auth.service.js");

const getProfile = asyncHandler(async (req, res) => {
  const result = await authService.getProfile(req.userId);

  res.status(200).json(result);
});

const updateProfile = asyncHandler(async (req, res) => {
  const result = await authService.updateProfile(req.userId, req.body);

  res.status(200).json(result);
});

const deleteAccount = asyncHandler(async (req, res) => {
  const result = await authService.deleteAccount(req.userId, req.body);

  res.status(200).json(result);
});

const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.userId, req.body);

  res.status(200).json(result);
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};
