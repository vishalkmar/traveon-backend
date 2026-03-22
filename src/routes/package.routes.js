import express from "express";
import {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
} from "../controller/package.controller.js";

const router = express.Router();

// Test endpoint - returns sample data for testing
router.get("/test", (req, res) => {
 
  return res.status(200).json({
    success: true,
    message: "Sample package data for testing",
  
  });
});

// POST - Create new package
router.post("/", createPackage);

// GET - Get all packages with filters and pagination
router.get("/", getAllPackages);

// GET - Get package by ID
router.get("/:id", getPackageById);

// PUT - Update package
router.put("/:id", updatePackage);

// DELETE - Delete package
router.delete("/:id", deletePackage);

export default router;
