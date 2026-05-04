import db from "../models/index.js";
import {
  clearCachedValue,
  getCachedValue,
  setCachedValue,
} from "../utils/responseCache.js";

const { ImageBanner } = db;
const ACTIVE_BANNERS_CACHE_KEY = "image-banners:active";
const ACTIVE_BANNERS_CACHE_TTL_MS = 60 * 1000;

// Normalize a redirect URL: trim, allow empty/null, prepend https:// for bare domains
const normalizeRedirectUrl = (url) => {
  if (url === null || url === undefined) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  // Allow internal paths like "/packages" or full external URLs
  if (trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  // Bare domain — prepend https
  return `https://${trimmed}`;
};

// Public: get all active banners ordered by displayOrder
export const getActiveBanners = async (req, res) => {
  try {
    const cachedResponse = getCachedValue(ACTIVE_BANNERS_CACHE_KEY);
    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }

    const banners = await ImageBanner.findAll({
      where: { isActive: true },
      order: [
        ["displayOrder", "ASC"],
        ["createdAt", "ASC"],
      ],
      attributes: ["id", "imageData", "displayOrder", "redirectUrl", "createdAt"],
    });
    const response = { success: true, data: banners };
    setCachedValue(
      ACTIVE_BANNERS_CACHE_KEY,
      response,
      ACTIVE_BANNERS_CACHE_TTL_MS
    );
    res.status(200).json(response);
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
      attributes: ["id", "imageData", "displayOrder", "isActive", "redirectUrl", "createdAt", "updatedAt"],
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
    const { imageData, displayOrder, isActive, redirectUrl } = req.body;

    if (!imageData || !imageData.trim()) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const normalizedUrl = normalizeRedirectUrl(redirectUrl);
    console.log("[createBanner] received redirectUrl:", JSON.stringify(redirectUrl), "→ normalized:", JSON.stringify(normalizedUrl));

    const banner = await ImageBanner.create({
      imageData,
      displayOrder: displayOrder ?? 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      redirectUrl: normalizedUrl,
    });
    clearCachedValue("image-banners:");

    console.log("[createBanner] saved banner.redirectUrl:", JSON.stringify(banner.redirectUrl));

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
    const { imageData, displayOrder, isActive, redirectUrl } = req.body;

    const banner = await ImageBanner.findByPk(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    if (imageData !== undefined) banner.imageData = imageData;
    if (displayOrder !== undefined) banner.displayOrder = Number(displayOrder);
    if (isActive !== undefined) banner.isActive = Boolean(isActive);
    if (redirectUrl !== undefined) {
      const normalizedUrl = normalizeRedirectUrl(redirectUrl);
      console.log("[updateBanner] received redirectUrl:", JSON.stringify(redirectUrl), "→ normalized:", JSON.stringify(normalizedUrl));
      banner.redirectUrl = normalizedUrl;
    }

    await banner.save();
    clearCachedValue("image-banners:");
    console.log("[updateBanner] after save, banner.redirectUrl:", JSON.stringify(banner.redirectUrl));

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
    clearCachedValue("image-banners:");
    res.status(200).json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ success: false, message: "Failed to delete banner", error: error.message });
  }
};

export default { getActiveBanners, getAllBanners, createBanner, updateBanner, deleteBanner };
