const express = require("express");
const fileController = require("../controllers/file.controller");
const auth = require("../middlewares/auth.middleware");
const uploadMiddleware = require("../middlewares/upload.middleware");

const router = express.Router();

router.get("/", auth, fileController.getFiles);
router.get("/:id/download", auth, fileController.downloadFile);

router.post("/upload", auth, uploadMiddleware, fileController.uploadFile);
router.delete("/:id", auth, fileController.deleteFile);

module.exports = router;
