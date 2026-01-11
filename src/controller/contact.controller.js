const { ContactQuery } = require("../models");
const { Op } = require("sequelize");

// 1. Submit Query (Public)
exports.submitQuery = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const newQuery = await ContactQuery.create({
      name,
      email,
      phone,
      subject,
      message,
    });
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
