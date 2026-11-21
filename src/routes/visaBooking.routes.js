import express from "express";
import {
  createVisaBooking,
  getAllVisaBookings,
  getVisaBookingById,
  updateVisaBookingStatus,
  deleteVisaBooking,
  updateVisaBookingDetails,
} from "../controller/visaBooking.controller.js";
import { formLimiter } from "../middleware/rateLimiter.js";
import { authenticateToken, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public: a visitor submits a visa application from the website form.
router.post("/booking", formLimiter, createVisaBooking);

// Admin only: applications hold passport data and personal documents.
const admin = [authenticateToken, authorize("admin")];
router.get("/bookings", admin, getAllVisaBookings);
router.get("/booking/:id", admin, getVisaBookingById);
router.put("/booking/:id/status", admin, updateVisaBookingStatus);
router.put("/booking/:id", admin, updateVisaBookingDetails);
router.delete("/booking/:id", admin, deleteVisaBooking);

export default router;
