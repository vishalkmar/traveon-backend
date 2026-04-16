import db from "../models/index.js";

const { WhatsappFlow } = db;

// Public: get all active flows ordered by displayOrder
export const getActiveFlows = async (req, res) => {
  try {
    const flows = await WhatsappFlow.findAll({
      where: { isActive: true },
      order: [
        ["displayOrder", "ASC"],
        ["createdAt", "ASC"],
      ],
      attributes: ["id", "title", "flowMessage", "imageData", "phoneNumber", "displayOrder"],
    });
    res.status(200).json({ success: true, data: flows });
  } catch (error) {
    console.error("Error fetching active whatsapp flows:", error);
    res.status(500).json({ success: false, message: "Failed to fetch flows", error: error.message });
  }
};

// Admin: get all flows (including inactive)
export const getAllFlows = async (req, res) => {
  try {
    const flows = await WhatsappFlow.findAll({
      order: [
        ["displayOrder", "ASC"],
        ["createdAt", "ASC"],
      ],
    });
    res.status(200).json({ success: true, data: flows });
  } catch (error) {
    console.error("Error fetching all whatsapp flows:", error);
    res.status(500).json({ success: false, message: "Failed to fetch flows", error: error.message });
  }
};

// Admin: create a new flow
export const createFlow = async (req, res) => {
  try {
    const { title, flowMessage, imageData, phoneNumber, displayOrder, isActive } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    if (!flowMessage || !flowMessage.trim()) {
      return res.status(400).json({ success: false, message: "Flow message is required" });
    }
    if (!phoneNumber || !phoneNumber.trim()) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    const flow = await WhatsappFlow.create({
      title: title.trim(),
      flowMessage: flowMessage.trim(),
      imageData: imageData || null,
      phoneNumber: phoneNumber.trim().replace(/\D/g, ""), // strip non-digits
      displayOrder: displayOrder ?? 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({ success: true, message: "Flow created successfully", data: flow });
  } catch (error) {
    console.error("Error creating whatsapp flow:", error);
    res.status(500).json({ success: false, message: "Failed to create flow", error: error.message });
  }
};

// Admin: update an existing flow
export const updateFlow = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, flowMessage, imageData, phoneNumber, displayOrder, isActive } = req.body;

    const flow = await WhatsappFlow.findByPk(id);
    if (!flow) {
      return res.status(404).json({ success: false, message: "Flow not found" });
    }

    if (title !== undefined) flow.title = title.trim();
    if (flowMessage !== undefined) flow.flowMessage = flowMessage.trim();
    if (imageData !== undefined) flow.imageData = imageData || null;
    if (phoneNumber !== undefined) flow.phoneNumber = phoneNumber.trim().replace(/\D/g, "");
    if (displayOrder !== undefined) flow.displayOrder = Number(displayOrder);
    if (isActive !== undefined) flow.isActive = Boolean(isActive);

    await flow.save();

    res.status(200).json({ success: true, message: "Flow updated successfully", data: flow });
  } catch (error) {
    console.error("Error updating whatsapp flow:", error);
    res.status(500).json({ success: false, message: "Failed to update flow", error: error.message });
  }
};

// Admin: delete a flow
export const deleteFlow = async (req, res) => {
  try {
    const { id } = req.params;
    const flow = await WhatsappFlow.findByPk(id);
    if (!flow) {
      return res.status(404).json({ success: false, message: "Flow not found" });
    }
    await flow.destroy();
    res.status(200).json({ success: true, message: "Flow deleted successfully" });
  } catch (error) {
    console.error("Error deleting whatsapp flow:", error);
    res.status(500).json({ success: false, message: "Failed to delete flow", error: error.message });
  }
};

export default { getActiveFlows, getAllFlows, createFlow, updateFlow, deleteFlow };
