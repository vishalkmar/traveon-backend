import express from "express";
// import { login, logout, updateDetails, updatePassword } from '../controller/authController.js';
// import { isAdmin } from '../middleware/auth.js';
import tourRoutes from "./tourBooking.routes.js";
import visaRoutes from "./visaBooking.routes.js";
import uploadRoutes from "./upload.routes.js";

const router = express.Router();

router.use("/v1/tour", tourRoutes);
router.use("/v1/visa", visaRoutes);
router.use("/v1/upload", uploadRoutes);

// Auth routes (commented out as per original file structure during refactor)
// router.post('/auth/login', login);
// router.post('/auth/logout', logout);
// router.put('/auth/update-details', isAdmin, updateDetails);
// router.put('/auth/update-password', isAdmin, updatePassword);

export default router;
