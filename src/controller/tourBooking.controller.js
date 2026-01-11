import db from "../models/index.js";
import { uploadBuffer } from "../services/cloudinary.js";
import { tourBookingSchema } from "../validation/booking.validation.js";
import { Op } from "sequelize";

// Extract models from the db object (which is exported as default from models/index.js)
// Note: Since models/index.js is likely CJS (dynamic loading), we import the default export.
const { TourBooking, TourTraveller, sequelize } = db;

export const createTourBooking = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { error } = tourBookingSchema.validate(req.body, {
      allowUnknown: true,
    });
    if (error) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const {
      contactName,
      contactEmail,
      contactPhone,
      numberOfTravellers,
      totalAmount,
      travellers,
    } = req.body;

    // In JSON payload, travellers should be an array already
    let parsedTravellers =
      typeof travellers === "string" ? JSON.parse(travellers) : travellers;

    if (
      !Array.isArray(parsedTravellers) ||
      parsedTravellers.length !== parseInt(numberOfTravellers)
    ) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Travellers data mismatch" });
    }

    const booking = await TourBooking.create(
      {
        contactName,
        contactEmail,
        contactPhone,
        numberOfTravellers,
        totalAmount,
      },
      { transaction: t }
    );

    const travellersToCreate = parsedTravellers.map((travellerData) => ({
      tourBookingId: booking.id,
      name: travellerData.name,
      passportScanUrl: travellerData.passportScan, // Frontend gives URL in this field now
      photoUrl: travellerData.photo,
      panCardUrl: travellerData.panCard,
      aadharCardUrl: travellerData.aadharCard,
      flightBookingUrl: travellerData.flightBooking || null,
    }));

    await TourTraveller.bulkCreate(travellersToCreate, { transaction: t });

    await t.commit();
    res.status(201).json({
      success: true,
      message: "Tour booking created successfully",
      bookingId: booking.id,
    });
  } catch (error) {
    if (t) await t.rollback();
    console.error("Tour Booking Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// GetAll with Pagination, Filter, Search
export const getAllTourBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { contactName: { [Op.iLike]: `%${search}%` } },
        { contactEmail: { [Op.iLike]: `%${search}%` } },
        { contactPhone: { [Op.iLike]: `%${search}%` } },
      ];
      // Check if search is UUID for ID lookup
      if (
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          search
        )
      ) {
        where[Op.or].push({ id: search });
      }
    }

    const { count, rows } = await TourBooking.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: TourTraveller,
          as: "travellers",
          attributes: ["id", "name"], // minimal data for list view
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    console.error("Get All Tour Bookings Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get One
export const getTourBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await TourBooking.findByPk(id, {
      include: [{ model: TourTraveller, as: "travellers" }],
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error("Get Tour Booking Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Status Only
export const updateTourBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, updatedBy } = req.body;

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const [updated] = await TourBooking.update(
      { status, updatedBy },
      { where: { id } }
    );

    if (updated) {
      const updatedBooking = await TourBooking.findByPk(id);
      return res.status(200).json({
        success: true,
        message: "Status updated",
        data: updatedBooking,
      });
    }

    return res
      .status(404)
      .json({ success: false, message: "Booking not found" });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Details (Contact Info Only for now)
export const updateTourBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { contactName, contactEmail, contactPhone, updatedBy } = req.body;

    const [updated] = await TourBooking.update(
      { contactName, contactEmail, contactPhone, updatedBy },
      { where: { id } }
    );

    if (updated) {
      const updatedBooking = await TourBooking.findByPk(id);
      return res.status(200).json({
        success: true,
        message: "Details updated",
        data: updatedBooking,
      });
    }

    return res
      .status(404)
      .json({ success: false, message: "Booking not found" });
  } catch (error) {
    console.error("Update Details Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete
export const deleteTourBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TourBooking.destroy({ where: { id } }); // Soft delete due to paranoid: true

    if (deleted) {
      return res
        .status(200)
        .json({ success: true, message: "Booking deleted successfully" });
    }

    return res
      .status(404)
      .json({ success: false, message: "Booking not found" });
  } catch (error) {
    console.error("Delete Booking Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
