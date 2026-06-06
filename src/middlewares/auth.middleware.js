const asyncHandler = require("../middleware/asynchandler");
const jwt = require("jsonwebtoken");

module.exports = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decode = jwt.verify(token, process.env.SECRET_KEYT);
    req.userId = decode.userId;
    req.userRole = decode.userRole;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
});
