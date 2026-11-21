import express from "express";
import { validateDocument } from "../controller/aiValidation.controller.js";
import upload, { verifyFileMagic } from "../middleware/upload.js"; // validates type/size/magic bytes
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Route: POST /api/v1/validation/validate
// Public (used by the booking form), but rate-limited because it calls a
// paid AI API, and the upload middleware only accepts images/PDF (by header
// and by real file signature).
router.post("/validate", aiLimiter, upload.single("file"), verifyFileMagic, validateDocument);

export default router;
