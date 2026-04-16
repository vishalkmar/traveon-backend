import express from "express";
import {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controller/imageBanner.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public: active banners for the home page slider
router.get("/active", getActiveBanners);

// Admin: all banners
router.get("/", authenticateToken, authorize("admin"), getAllBanners);

// Admin: create
router.post("/", authenticateToken, authorize("admin"), createBanner);

// Admin: update
router.put("/:id", authenticateToken, authorize("admin"), updateBanner);

// Admin: delete
router.delete("/:id", authenticateToken, authorize("admin"), deleteBanner);

export default router;
