import express from "express";
import destinationController from "../controller/destination.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", destinationController.getAllDestinations);
router.get("/:slug", destinationController.getDestinationWithBlogs);

// Admin routes (protected)
router.post("/", authenticateToken, destinationController.createDestination);
router.patch("/:id", authenticateToken, destinationController.updateDestination);
router.delete("/:id", authenticateToken, destinationController.deleteDestination);

export default router;
