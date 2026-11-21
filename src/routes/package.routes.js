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
import { authenticateToken, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin guard for every write operation on packages.
const admin = [authenticateToken, authorize("admin")];

// GET routes are public — the website lists and shows packages to visitors.
router.get("/test", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Sample package data for testing",
  });
});

// Writes (create / upsert / update / delete) are admin only.
router.post("/", admin, createPackage);
router.post("/upsert", admin, upsertPackageByGtxPkgId);

// Explicit GTX id routes (must be before /:id so "gtx" is not captured as id)
router.get("/gtx/:gtxPkgId", getPackageByGtxPkgId);
router.put("/gtx/:gtxPkgId", admin, updatePackageByGtxPkgId);
router.delete("/gtx/:gtxPkgId", admin, deletePackageByGtxPkgId);

router.get("/", getAllPackages);
router.get("/:id", getPackageById);
router.put("/:id", admin, updatePackage);
router.delete("/:id", admin, deletePackage);

export default router;
