import express from "express";
import {
  createTourBooking,
  getAllTourBookings,
  getTourBookingById,
  updateTourBookingStatus,
  deleteTourBooking,
  updateTourBookingDetails,
} from "../controller/tourBooking.controller.js";
import { formLimiter } from "../middleware/rateLimiter.js";
import { authenticateToken, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public: a visitor submits a booking from the website form.
router.post("/booking", formLimiter, createTourBooking);

// Admin only: bookings hold customer PII and passport documents.
const admin = [authenticateToken, authorize("admin")];
router.get("/bookings", admin, getAllTourBookings);
router.get("/booking/:id", admin, getTourBookingById);
router.put("/booking/:id/status", admin, updateTourBookingStatus);
router.put("/booking/:id", admin, updateTourBookingDetails);
router.delete("/booking/:id", admin, deleteTourBooking);

export default router;
