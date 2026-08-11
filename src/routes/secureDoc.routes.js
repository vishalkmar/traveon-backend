import express from "express";
import { createSession, streamDocument } from "../controller/secureDoc.controller.js";
import { secureDocLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Hand out a short-lived token + AES key for one viewing session.
router.post("/:slug/session", secureDocLimiter, createSession);

// Encrypted byte stream — useless without the key from /session.
router.get("/:slug/stream", secureDocLimiter, streamDocument);

export default router;
