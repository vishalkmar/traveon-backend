import db from "../models/index.js";
import { uploadBuffer } from "../services/cloudinary.js";
import { visaBookingSchema } from "../validation/booking.validation.js";
import { sendEmail, EMAIL_SENDERS } from "../services/email.service.js";
import {
  visaBookingUserTemplate,
  visaBookingAdminTemplate,
} from "../services/emailTemplates.js";
import { Op } from "sequelize";

// Extract models from the db object
const { VisaBooking, VisaTraveller, sequelize } = db;

// Create Booking
export const createVisaBooking = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { error } = visaBookingSchema.validate(req.body, {
      allowUnknown: true,
    });
    if (error) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const {
      visaType,
      contactName,
      contactEmail,
      contactPhone,
      numberOfTravellers,
      totalAmount,
      travellers,
    } = req.body;

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

    const booking = await VisaBooking.create(
      {
        visaType,
        contactName,
        contactEmail,
        contactPhone,
        numberOfTravellers,
        totalAmount,
      },
      { transaction: t }
    );

    const travellersToCreate = parsedTravellers.map((travellerData) => ({
      visaBookingId: booking.id,
      name: travellerData.name,
      passportScanUrl: travellerData.passportScan,
      photoUrl: travellerData.photo,
    }));

    await VisaTraveller.bulkCreate(travellersToCreate, { transaction: t });

    await t.commit();

    // Send Emails (Async)
    const emailPayload = {
      bookingId: booking.id,
      visaType,
      contactName,
      contactEmail,
      contactPhone,
      numberOfTravellers,
      totalAmount,
      travellers: travellersToCreate,
    };

    // 1. User Confirmation
    sendEmail({
      to: contactEmail,
      subject: "Visa Application Received - Traveon",
      html: visaBookingUserTemplate(emailPayload),
      sender: EMAIL_SENDERS.OPERATIONS,
    }).catch((err) => console.error("Failed to send visa user email:", err));

    // 2. Admin Notification
    sendEmail({
      to: EMAIL_SENDERS.OPERATIONS.email,
      subject: `New Visa Application ALERT: ${contactName}`,
      html: visaBookingAdminTemplate(emailPayload),
      sender: EMAIL_SENDERS.OPERATIONS,
    }).catch((err) => console.error("Failed to send visa admin email:", err));

    res.status(201).json({
      success: true,
      message: "Visa booking created successfully",
      bookingId: booking.id,
    });
  } catch (error) {
    if (t) await t.rollback();
    console.error("Visa Booking Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getAllVisaBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, visaType } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (visaType) {
      where.visaType = visaType;
    }

    if (search) {
      where[Op.or] = [
        { contactName: { [Op.iLike]: `%${search}%` } },
        { contactEmail: { [Op.iLike]: `%${search}%` } },
        { contactPhone: { [Op.iLike]: `%${search}%` } },
      ];
      if (
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          search
        )
      ) {
        where[Op.or].push({ id: search });
      }
    }

    const { count, rows } = await VisaBooking.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: VisaTraveller,
          as: "travellers",
          attributes: ["id", "name"],
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
    console.error("Get All Visa Bookings Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVisaBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await VisaBooking.findByPk(id, {
      include: [{ model: VisaTraveller, as: "travellers" }],
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error("Get Visa Booking Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVisaBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, updatedBy } = req.body;

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const [updated] = await VisaBooking.update(
      { status, updatedBy },
      { where: { id } }
    );

    if (updated) {
      const updatedBooking = await VisaBooking.findByPk(id);
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

export const updateVisaBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { contactName, contactEmail, contactPhone, updatedBy } = req.body;

    const [updated] = await VisaBooking.update(
      { contactName, contactEmail, contactPhone, updatedBy },
      { where: { id } }
    );

    if (updated) {
      const updatedBooking = await VisaBooking.findByPk(id);
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

export const deleteVisaBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await VisaBooking.destroy({ where: { id } });

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
