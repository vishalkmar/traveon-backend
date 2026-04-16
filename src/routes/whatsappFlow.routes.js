import express from "express";
import {
  getActiveFlows,
  getAllFlows,
  createFlow,
  updateFlow,
  deleteFlow,
} from "../controller/whatsappFlow.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public: active flows for the widget
router.get("/active", getActiveFlows);

// Admin: all flows
router.get("/", authenticateToken, authorize("admin"), getAllFlows);

// Admin: create
router.post("/", authenticateToken, authorize("admin"), createFlow);

// Admin: update
router.put("/:id", authenticateToken, authorize("admin"), updateFlow);

// Admin: delete
router.delete("/:id", authenticateToken, authorize("admin"), deleteFlow);

export default router;
