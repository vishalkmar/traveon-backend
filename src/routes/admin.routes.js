const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth.middleware");
const { TourBooking, VisaBooking, ContactQuery, User, Blog } = require("../models");

// Get Dashboard Stats
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const tourCount = await TourBooking.count();
    const visa10Count = await VisaBooking.count({
      where: { visaType: "10_DAYS" },
    });
    const visa30Count = await VisaBooking.count({
      where: { visaType: "30_DAYS" },
    });
    const queryCount = await ContactQuery.count();
    const blogCount = await Blog.count();
    const totalInquiries = tourCount + visa10Count + visa30Count;

    res.json({
      success: true,
      data: {
        tourCount,
        visa10Count,
        visa30Count,
        queryCount,
        blogCount,
        totalInquiries,
      },
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ success: false, message: "Error fetching stats" });
  }
});

module.exports = router;
