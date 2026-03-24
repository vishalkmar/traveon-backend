const { ContactQuery } = require("../models");
const { Op } = require("sequelize");
const { sendEmail, EMAIL_SENDERS } = require("../services/email.service.js");
const {
  contactQueryUserTemplate,
  contactQueryAdminTemplate,
} = require("../services/emailTemplates.js");
const { contactSchema } = require("../validation/contact.validation.js");

// 1. Submit Query (Public)
exports.submitQuery = async (req, res) => {
  try {
    const { error } = contactSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { name, email, phone, subject, message } = req.body;
    const newQuery = await ContactQuery.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    // Send Notification Email to Admin Only (Fire & Forget)
    sendEmail({
      to: EMAIL_SENDERS.INFO.email,
      sender: { name: name, email: email },
      subject: `New Contact Query: ${subject}`,
      html: contactQueryAdminTemplate({ name, email, phone, subject, message }),
    }).catch((err) =>
      console.error("Failed to send admin notification email:", err)
    );

    res.status(201).json({ success: true, data: newQuery });
  } catch (error) {
    console.error("Error submitting query:", error);
    res.status(500).json({ success: false, message: "Failed to submit query" });
  }
};

// 2. Get All Queries (Admin)
exports.getAllQueries = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await ContactQuery.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
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
    console.error("Error fetching queries:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch queries" });
  }
};

// 3. Delete Query (Admin)
exports.deleteQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ContactQuery.destroy({ where: { id } });
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Query not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Query deleted successfully" });
  } catch (error) {
    console.error("Error deleting query:", error);
    res.status(500).json({ success: false, message: "Failed to delete query" });
  }
};
