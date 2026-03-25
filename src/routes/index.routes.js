import express from "express";
import tourRoutes from "./tourBooking.routes.js";
import visaRoutes from "./visaBooking.routes.js";
import uploadRoutes from "./upload.routes.js";
import authRoutes from "./auth.routes.js";
import contactRoutes from "./contact.routes.js";
import adminRoutes from "./admin.routes.js";
import validationRoutes from "./aiValidation.routes.js";
import packageRoutes from "./package.routes.js";
import destinationRoutes from "./destination.routes.js";
import blogRoutes from "./blog.routes.js";
import { apiLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Apply global rate limiter
router.use(apiLimiter);

router.use("/v1/tour", tourRoutes);
router.use("/v1/visa", visaRoutes);
router.use("/v1/upload", uploadRoutes);
router.use("/v1/auth", authRoutes);
router.use("/v1/contact", contactRoutes);
router.use("/v1/admin", adminRoutes);
router.use("/v1/validation", validationRoutes);
router.use("/v1/packages", packageRoutes);
router.use("/v1/destinations", destinationRoutes);
router.use("/v1/blog", blogRoutes);

export default router;
