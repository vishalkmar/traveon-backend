import express from "express";
import {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  upsertPackageByGtxPkgId,
  getPackageByGtxPkgId,
  updatePackageByGtxPkgId,
  deletePackageByGtxPkgId,
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

// POST - Create or update by gtxPkgId (body must include gtxPkgId)
router.post("/upsert", upsertPackageByGtxPkgId);

// Explicit GTX id routes (must be before /:id so "gtx" is not captured as id)
router.get("/gtx/:gtxPkgId", getPackageByGtxPkgId);
router.put("/gtx/:gtxPkgId", updatePackageByGtxPkgId);
router.delete("/gtx/:gtxPkgId", deletePackageByGtxPkgId);

// GET - Get all packages with filters and pagination
router.get("/", getAllPackages);

// GET/PUT/DELETE by UUID or numeric GTX id — :id can be packages.id OR gtxPkgId
router.get("/:id", getPackageById);

router.put("/:id", updatePackage);

router.delete("/:id", deletePackage);

export default router;
