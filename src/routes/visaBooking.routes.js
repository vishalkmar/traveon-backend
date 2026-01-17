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

const router = express.Router();

router.post("/booking", formLimiter, createVisaBooking);
router.get("/bookings", getAllVisaBookings);
router.get("/booking/:id", getVisaBookingById);
router.put("/booking/:id/status", updateVisaBookingStatus);
router.put("/booking/:id", updateVisaBookingDetails);
router.delete("/booking/:id", deleteVisaBooking);

export default router;
