import express from "express";
import { getActiveReviews, getAllReviews, createReview, updateReview, deleteReview } from "../controller/review.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public: active reviews for home page
router.get("/active", getActiveReviews);

// Admin routes
router.get("/", authenticateToken, authorize("admin"), getAllReviews);
router.post("/", authenticateToken, authorize("admin"), createReview);
router.put("/:id", authenticateToken, authorize("admin"), updateReview);
router.delete("/:id", authenticateToken, authorize("admin"), deleteReview);

export default router;
