import express from "express";
import { getActiveTeamMembers, getAllTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from "../controller/teamMember.controller.js";
import { authenticateToken, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public: active team members for about page
router.get("/active", getActiveTeamMembers);

// Admin routes
router.get("/", authenticateToken, authorize("admin"), getAllTeamMembers);
router.post("/", authenticateToken, authorize("admin"), createTeamMember);
router.put("/:id", authenticateToken, authorize("admin"), updateTeamMember);
router.delete("/:id", authenticateToken, authorize("admin"), deleteTeamMember);

export default router;
