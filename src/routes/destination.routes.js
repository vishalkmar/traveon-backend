import express from "express";
import destinationController from "../controller/destination.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.middleware.js";

const adminOnly = [authenticateToken, authorize("admin")];

const router = express.Router();

// Public routes
router.get("/", destinationController.getAllDestinations);
router.get("/:slug", destinationController.getDestinationWithBlogs);

// Admin routes (protected)
router.post("/", adminOnly, destinationController.createDestination);
router.patch("/:id", adminOnly, destinationController.updateDestination);
router.delete("/:id", adminOnly, destinationController.deleteDestination);

export default router;
