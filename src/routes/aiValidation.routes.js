import express from "express";
import { validateDocument } from "../controller/aiValidation.controller.js";
import upload from "../middleware/upload.js"; // Multer middleware
import { authenticateToken } from "../middleware/auth.middleware.js"; // Optional: protect if needed

const router = express.Router();

// Route: POST /api/v1/validation/validate
// Expects 'file' in formdata and 'docType' in body
router.post("/validate", upload.single("file"), validateDocument);

export default router;
