const express = require("express");
const router = express.Router();
const destinationController = require("../controller/destination.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

// Public routes
router.get("/", destinationController.getAllDestinations);
router.get("/:slug", destinationController.getDestinationWithBlogs);

// Admin routes (protected)
router.post("/", authenticateToken, destinationController.createDestination);
router.patch("/:id", authenticateToken, destinationController.updateDestination);
router.delete("/:id", authenticateToken, destinationController.deleteDestination);

module.exports = router;
