import express from "express";
import {
  createTourBooking,
  getAllTourBookings,
  getTourBookingById,
  updateTourBookingStatus,
  deleteTourBooking,
  updateTourBookingDetails,
} from "../controller/tourBooking.controller.js";

const router = express.Router();

router.post("/booking", createTourBooking);
router.get("/bookings", getAllTourBookings);
router.get("/booking/:id", getTourBookingById);
router.put("/booking/:id/status", updateTourBookingStatus);
router.put("/booking/:id", updateTourBookingDetails);
router.delete("/booking/:id", deleteTourBooking);

export default router;
