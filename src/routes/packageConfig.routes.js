import express from "express";
import {
  getCountriesFromPackages,
  getAllPackagesConfig,
  getEnabledPackages,
  getPackageConfigDetails,
  togglePackageStatus,
  toggleTopSelling,
  getTopSellingGtxIds,
  getPackageFlowString,
  updateFlowString,
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

// Get top-selling gtxPkgIds (public)
router.get("/top-selling", getTopSellingGtxIds);

// Public: get custom flow string for a package (used by Book Now)
router.get("/:gtxPkgId/flow-string", getPackageFlowString);

// Admin: set/update/clear flow string for a package
router.put(
  "/:gtxPkgId/flow-string",
  authenticateToken,
  authorize("admin"),
  updateFlowString
);

// Get package config details
router.get("/:gtxPkgId", getPackageConfigDetails);

// Toggle package status (admin only)
router.put(
  "/:gtxPkgId/toggle",
  authenticateToken,
  authorize("admin"),
  togglePackageStatus
);

// Toggle top-selling flag (admin only)
router.put(
  "/:gtxPkgId/top-selling",
  authenticateToken,
  authorize("admin"),
  toggleTopSelling
);

// Bulk update package status (admin only)
router.post(
  "/bulk/update",
  authenticateToken,
  authorize("admin"),
  bulkUpdatePackageStatus
);

export default router;
