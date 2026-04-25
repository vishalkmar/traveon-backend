const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth.middleware");
const {
  TourBooking,
  VisaBooking,
  ContactQuery,
  User,
  Blog,
  PackageConfig,
  ImageBanner,
  WhatsappFlow,
  Destination,
} = require("../models");

// Get Dashboard Stats
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const safeCount = async (model, options) => {
      try {
        return model ? await model.count(options) : 0;
      } catch {
        return 0;
      }
    };

    const tourCount = await safeCount(TourBooking);
    const visa10Count = await safeCount(VisaBooking, {
      where: { visaType: "10_DAYS" },
    });
    const visa30Count = await safeCount(VisaBooking, {
      where: { visaType: "30_DAYS" },
    });
    const queryCount = await safeCount(ContactQuery);
    const blogCount = await safeCount(Blog);
    const destinationCount = await safeCount(Destination);
    const packageConfigCount = await safeCount(PackageConfig, {
      where: { isEnabled: true },
    });
    const bannerCount = await safeCount(ImageBanner);
    const whatsappFlowCount = await safeCount(WhatsappFlow);
    const totalInquiries = tourCount + visa10Count + visa30Count + queryCount;

    res.json({
      success: true,
      data: {
        tourCount,
        visa10Count,
        visa30Count,
        queryCount,
        blogCount,
        destinationCount,
        packageConfigCount,
        bannerCount,
        whatsappFlowCount,
        totalInquiries,
      },
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ success: false, message: "Error fetching stats" });
  }
});

module.exports = router;
