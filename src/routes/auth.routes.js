const express = require("express");
const router = express.Router();
const authController = require("../controller/auth.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { authLimiter, verifyLimiter } = require("../middleware/rateLimiter");

// Sign-in (password, then a second factor when one is enabled)
router.post("/login", authLimiter, authController.login);
router.post("/login/email-code", authLimiter, authController.sendLoginEmailCode);
router.post("/login/verify", verifyLimiter, authController.verifyLogin);
router.post("/logout", authController.logout);

// Two-factor settings for the logged-in admin
router.get("/2fa/status", authenticateToken, authController.getSecurityStatus);
router.post("/2fa/totp/setup", authenticateToken, authController.startTotpSetup);
router.post("/2fa/totp/enable", authenticateToken, authLimiter, authController.enableTotp);
router.post("/2fa/stepup/email", authenticateToken, authLimiter, authController.sendStepUpCode);
router.post("/2fa/totp/disable", authenticateToken, authLimiter, authController.disableTotp);
router.post("/2fa/email/setup", authenticateToken, authLimiter, authController.startEmailSetup);
router.post("/2fa/email/enable", authenticateToken, authLimiter, authController.enableEmail);
router.post("/2fa/email/disable", authenticateToken, authLimiter, authController.disableEmail);

module.exports = router;
