import express from "express";
import upload, { verifyFileMagic } from "../middleware/upload.js";
import { uploadFile } from "../controller/upload.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin-only: the browser never sees Cloudinary credentials; it sends the
// file here and the server signs the upload with CLOUDINARY_API_SECRET.
router.post(
  "/",
  authenticateToken,
  authorize("admin"),
  upload.single("file"),
  verifyFileMagic,
  uploadFile
);

export default router;
