const express = require("express");
const router = express.Router();
const contactController = require("../controller/contact.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { formLimiter } = require("../middleware/rateLimiter.js");

// Public
router.post("/submit", formLimiter, contactController.submitQuery);

// Protected (Admin)
router.get("/", authenticateToken, contactController.getAllQueries);
router.delete("/:id", authenticateToken, contactController.deleteQuery);

module.exports = router;
