const authService = require("../services/auth.service");
const asyncHandler = require("../middlewares/asyncHandler");

const Register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  res.status(201).json(result);
});

const Login = asyncHandler(async (req, res) => {
  const result = await authService.Login(req.body);

  res.status(200).json(result);
});
module.exports = {
  Register,
  Login,
};
