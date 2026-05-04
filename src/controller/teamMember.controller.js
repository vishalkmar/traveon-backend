import db from "../models/index.js";
import { getCachedValue, setCachedValue, clearCachedValue } from "../utils/responseCache.js";

const { TeamMember } = db;
const CACHE_KEY = "team-members:active";
const CACHE_TTL_MS = 60 * 1000;

// Public: get all active team members
export const getActiveTeamMembers = async (req, res) => {
  try {
    const cached = getCachedValue(CACHE_KEY);
    if (cached) return res.status(200).json(cached);

    const members = await TeamMember.findAll({
      where: { isActive: true },
      order: [["memberType", "ASC"], ["displayOrder", "ASC"], ["createdAt", "ASC"]],
      attributes: ["id", "memberType", "name", "description", "position", "imageData", "displayOrder"],
    });
    const response = { success: true, data: members };
    setCachedValue(CACHE_KEY, response, CACHE_TTL_MS);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ success: false, message: "Failed to fetch team members", error: error.message });
  }
};

// Admin: get all
export const getAllTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.findAll({
      order: [["memberType", "ASC"], ["displayOrder", "ASC"], ["createdAt", "ASC"]],
    });
    res.status(200).json({ success: true, data: members });
  } catch (error) {
    console.error("Error fetching all team members:", error);
    res.status(500).json({ success: false, message: "Failed to fetch team members", error: error.message });
  }
};

// Admin: create
export const createTeamMember = async (req, res) => {
  try {
    const { memberType, name, description, position, imageData, displayOrder, isActive } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });
    if (!["leader", "member"].includes(memberType)) {
      return res.status(400).json({ success: false, message: "memberType must be 'leader' or 'member'" });
    }

    const member = await TeamMember.create({
      memberType,
      name: name.trim(),
      description: description?.trim() || null,
      position: position?.trim() || null,
      imageData: imageData || null,
      displayOrder: displayOrder ?? 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });
    clearCachedValue("team-members:");
    res.status(201).json({ success: true, message: "Team member created", data: member });
  } catch (error) {
    console.error("Error creating team member:", error);
    res.status(500).json({ success: false, message: "Failed to create team member", error: error.message });
  }
};

// Admin: update
export const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberType, name, description, position, imageData, displayOrder, isActive } = req.body;

    const member = await TeamMember.findByPk(id);
    if (!member) return res.status(404).json({ success: false, message: "Team member not found" });

    if (memberType !== undefined) {
      if (!["leader", "member"].includes(memberType)) {
        return res.status(400).json({ success: false, message: "memberType must be 'leader' or 'member'" });
      }
      member.memberType = memberType;
    }
    if (name !== undefined) member.name = name.trim();
    if (description !== undefined) member.description = description?.trim() || null;
    if (position !== undefined) member.position = position?.trim() || null;
    if (imageData !== undefined) member.imageData = imageData || null;
    if (displayOrder !== undefined) member.displayOrder = Number(displayOrder);
    if (isActive !== undefined) member.isActive = Boolean(isActive);

    await member.save();
    clearCachedValue("team-members:");
    res.status(200).json({ success: true, message: "Team member updated", data: member });
  } catch (error) {
    console.error("Error updating team member:", error);
    res.status(500).json({ success: false, message: "Failed to update team member", error: error.message });
  }
};

// Admin: delete
export const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await TeamMember.findByPk(id);
    if (!member) return res.status(404).json({ success: false, message: "Team member not found" });
    await member.destroy();
    clearCachedValue("team-members:");
    res.status(200).json({ success: true, message: "Team member deleted" });
  } catch (error) {
    console.error("Error deleting team member:", error);
    res.status(500).json({ success: false, message: "Failed to delete team member", error: error.message });
  }
};

export default { getActiveTeamMembers, getAllTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember };
