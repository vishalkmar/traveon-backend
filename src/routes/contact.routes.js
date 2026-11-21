const express = require("express");
const router = express.Router();
const contactController = require("../controller/contact.controller");
const { authenticateToken, authorize } = require("../middleware/auth.middleware");
const { formLimiter } = require("../middleware/rateLimiter.js");

const adminOnly = [authenticateToken, authorize("admin")];

// Public
router.post("/submit", formLimiter, contactController.submitQuery);

// Protected (Admin) — contact queries hold visitor PII
router.get("/", adminOnly, contactController.getAllQueries);
router.delete("/:id", adminOnly, contactController.deleteQuery);

module.exports = router;
