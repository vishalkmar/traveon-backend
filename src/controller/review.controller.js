import db from "../models/index.js";
import { getCachedValue, setCachedValue, clearCachedValue } from "../utils/responseCache.js";

const { Review } = db;
const ACTIVE_REVIEWS_CACHE_KEY = "reviews:active";
const CACHE_TTL_MS = 60 * 1000;

// Public: get active reviews
export const getActiveReviews = async (req, res) => {
  try {
    const cached = getCachedValue(ACTIVE_REVIEWS_CACHE_KEY);
    if (cached) return res.status(200).json(cached);

    const reviews = await Review.findAll({
      where: { isActive: true },
      order: [["displayOrder", "ASC"], ["createdAt", "ASC"]],
      attributes: ["id", "name", "rating", "content", "imageData", "displayOrder"],
    });
    const response = { success: true, data: reviews };
    setCachedValue(ACTIVE_REVIEWS_CACHE_KEY, response, CACHE_TTL_MS);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reviews", error: error.message });
  }
};

// Admin: get all reviews
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      order: [["displayOrder", "ASC"], ["createdAt", "ASC"]],
    });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reviews", error: error.message });
  }
};

// Admin: create
export const createReview = async (req, res) => {
  try {
    const { name, rating, content, description, imageData, displayOrder, isActive } = req.body;
    const reviewText = content ?? description;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });
    if (!reviewText?.trim()) return res.status(400).json({ success: false, message: "Description is required" });

    const review = await Review.create({
      name: name.trim(),
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      content: reviewText.trim(),
      imageData: imageData || null,
      displayOrder: displayOrder ?? 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });
    clearCachedValue("reviews:");
    res.status(201).json({ success: true, message: "Review created", data: review });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ success: false, message: "Failed to create review", error: error.message });
  }
};

// Admin: update
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rating, content, description, imageData, displayOrder, isActive } = req.body;

    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    if (name !== undefined) review.name = name.trim();
    if (rating !== undefined) review.rating = Math.min(5, Math.max(1, Number(rating)));
    if (content !== undefined || description !== undefined) review.content = (content ?? description).trim();
    if (imageData !== undefined) review.imageData = imageData || null;
    if (displayOrder !== undefined) review.displayOrder = Number(displayOrder);
    if (isActive !== undefined) review.isActive = Boolean(isActive);

    await review.save();
    clearCachedValue("reviews:");
    res.status(200).json({ success: true, message: "Review updated", data: review });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ success: false, message: "Failed to update review", error: error.message });
  }
};

// Admin: delete
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    await review.destroy();
    clearCachedValue("reviews:");
    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ success: false, message: "Failed to delete review", error: error.message });
  }
};

export default { getActiveReviews, getAllReviews, createReview, updateReview, deleteReview };
