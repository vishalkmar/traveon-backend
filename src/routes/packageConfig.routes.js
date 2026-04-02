import express from "express";
import {
  getCountriesFromPackages,
  getAllPackagesConfig,
  getEnabledPackages,
  getPackageConfigDetails,
  togglePackageStatus,
  bulkUpdatePackageStatus
} from "../controller/packageConfig.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get all countries from packages
router.get("/countries", getCountriesFromPackages);

// Get all package configurations with filters
router.get("/", getAllPackagesConfig);

// Get enabled packages
router.get("/enabled", getEnabledPackages);

// Get package config details
router.get("/:gtxPkgId", getPackageConfigDetails);

// Toggle package status (admin only)
router.put(
  "/:gtxPkgId/toggle",
  authenticateToken,
  authorize("admin"),
  togglePackageStatus
);

// Bulk update package status (admin only)
router.post(
  "/bulk/update",
  authenticateToken,
  authorize("admin"),
  bulkUpdatePackageStatus
);

export default router;
