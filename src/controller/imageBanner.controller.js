import db from "../models/index.js";

const { ImageBanner } = db;

// Public: get all active banners ordered by displayOrder
export const getActiveBanners = async (req, res) => {
  try {
    const banners = await ImageBanner.findAll({
      where: { isActive: true },
      order: [
        ["displayOrder", "ASC"],
        ["createdAt", "ASC"],
      ],
      attributes: ["id", "imageData", "displayOrder", "createdAt"],
    });
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    console.error("Error fetching active banners:", error);
    res.status(500).json({ success: false, message: "Failed to fetch banners", error: error.message });
  }
};

// Admin: get all banners including inactive
export const getAllBanners = async (req, res) => {
  try {
    const banners = await ImageBanner.findAll({
      order: [
        ["displayOrder", "ASC"],
        ["createdAt", "ASC"],
      ],
      attributes: ["id", "imageData", "displayOrder", "isActive", "createdAt", "updatedAt"],
    });
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    console.error("Error fetching all banners:", error);
    res.status(500).json({ success: false, message: "Failed to fetch banners", error: error.message });
  }
};

// Admin: create a new banner
export const createBanner = async (req, res) => {
  try {
    const { imageData, displayOrder, isActive } = req.body;

    if (!imageData || !imageData.trim()) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const banner = await ImageBanner.create({
      imageData,
      displayOrder: displayOrder ?? 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({ success: true, message: "Banner created successfully", data: banner });
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({ success: false, message: "Failed to create banner", error: error.message });
  }
};

// Admin: update a banner
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageData, displayOrder, isActive } = req.body;

    const banner = await ImageBanner.findByPk(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    if (imageData !== undefined) banner.imageData = imageData;
    if (displayOrder !== undefined) banner.displayOrder = Number(displayOrder);
    if (isActive !== undefined) banner.isActive = Boolean(isActive);

    await banner.save();

    res.status(200).json({ success: true, message: "Banner updated successfully", data: banner });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ success: false, message: "Failed to update banner", error: error.message });
  }
};

// Admin: delete a banner
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await ImageBanner.findByPk(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }
    await banner.destroy();
    res.status(200).json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ success: false, message: "Failed to delete banner", error: error.message });
  }
};

export default { getActiveBanners, getAllBanners, createBanner, updateBanner, deleteBanner };
