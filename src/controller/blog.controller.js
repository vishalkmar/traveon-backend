import db from "../models/index.js";
import {
  clearCachedValue,
  getCachedValue,
  setCachedValue,
} from "../utils/responseCache.js";

const { Blog, Destination } = db;
import { v4 as uuidv4 } from "uuid";

const BLOG_LIST_CACHE_PREFIX = "blogs:list:";
const BLOG_DETAIL_CACHE_PREFIX = "blogs:detail:";
const BLOG_SLUG_CACHE_PREFIX = "blogs:slug:";
const BLOG_DESTINATION_CACHE_PREFIX = "blogs:destination:";
const BLOG_CACHE_TTL_MS = 60 * 1000;

// Create Blog
export const createBlog = async (req, res) => {
  try {
    const { title, destinationId, images, excerpt, content, author, category, readTime, date } = req.body;

    // Validate required fields
    if (!title || !destinationId || !images || !Array.isArray(images) || images.length === 0 || !excerpt || !content) {
      return res.status(400).json({
        success: false,
        message: "Title, destinationId, images array, excerpt, and content are required",
      });
    }

    // Check if destination exists
    const destination = await Destination.findByPk(destinationId);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    // Create slug from title
    const slug = title.toLowerCase().replace(/\s+/g, "-") + "-" + uuidv4().substring(0, 8);

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ where: { slug } });
    if (existingBlog) {
      return res.status(400).json({
        success: false,
        message: "Blog with similar title already exists",
      });
    }

    const blog = await Blog.create({
      id: uuidv4(),
      title,
      slug,
      destinationId,
      image: images[0], // First image as primary
      images,
      excerpt,
      content,
      author: author || "Admin",
      category: category || "Travel",
      readTime: readTime || "5 min read",
      date: date || new Date().toISOString().split('T')[0],
    });
    clearCachedValue("blogs:");
    clearCachedValue("destinations:list");

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Create Blog Error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating blog",
      error: error.message,
    });
  }
};

// Get All Blogs
export const getAllBlogs = async (req, res) => {
  try {
    const { destinationId, category, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const cacheKey = `${BLOG_LIST_CACHE_PREFIX}${JSON.stringify({
      destinationId: destinationId || null,
      category: category || null,
      page: pageNumber,
      limit: limitNumber,
    })}`;

    const cachedResponse = getCachedValue(cacheKey);
    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }
    
    let where = {};
    if (destinationId) where.destinationId = destinationId;
    if (category) where.category = category;

    const offset = (pageNumber - 1) * limitNumber;

    const { count, rows } = await Blog.findAndCountAll({
      where,
      include: [
        {
          model: Destination,
          as: "destination",
          attributes: ["id", "name", "slug"],
        },
      ],
      limit: limitNumber,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const response = {
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(count / limitNumber),
      },
    };

    setCachedValue(cacheKey, response, BLOG_CACHE_TTL_MS);
    res.status(200).json(response);
  } catch (error) {
    console.error("Get Blogs Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blogs",
      error: error.message,
    });
  }
};

// Get Blog By ID
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `${BLOG_DETAIL_CACHE_PREFIX}${id}`;
    const cachedResponse = getCachedValue(cacheKey);
    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }

    const blog = await Blog.findByPk(id, {
      include: [
        {
          model: Destination,
          as: "destination",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const response = {
      success: true,
      data: blog,
    };

    setCachedValue(cacheKey, response, BLOG_CACHE_TTL_MS);
    res.status(200).json(response);
  } catch (error) {
    console.error("Get Blog By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blog",
      error: error.message,
    });
  }
};

// Get Blog By Slug
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const cacheKey = `${BLOG_SLUG_CACHE_PREFIX}${slug}`;
    const cachedResponse = getCachedValue(cacheKey);
    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }

    const blog = await Blog.findOne({
      where: { slug },
      include: [
        {
          model: Destination,
          as: "destination",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const response = {
      success: true,
      data: blog,
    };

    setCachedValue(cacheKey, response, BLOG_CACHE_TTL_MS);
    res.status(200).json(response);
  } catch (error) {
    console.error("Get Blog By Slug Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blog",
      error: error.message,
    });
  }
};

// Update Blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, destinationId, images, excerpt, content, author, category, readTime, date } = req.body;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Check if destination exists if provided
    if (destinationId && destinationId !== blog.destinationId) {
      const destination = await Destination.findByPk(destinationId);
      if (!destination) {
        return res.status(404).json({
          success: false,
          message: "Destination not found",
        });
      }
    }

    const updatedImages = images || blog.images;
    const primaryImage = Array.isArray(updatedImages) && updatedImages.length > 0 ? updatedImages[0] : blog.image;

    await blog.update({
      title: title || blog.title,
      destinationId: destinationId || blog.destinationId,
      image: primaryImage,
      images: updatedImages,
      excerpt: excerpt || blog.excerpt,
      content: content || blog.content,
      author: author !== undefined ? author : blog.author,
      category: category || blog.category,
      readTime: readTime || blog.readTime,
      date: date || blog.date,
    });
    clearCachedValue("blogs:");
    clearCachedValue("destinations:list");

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Update Blog Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating blog",
      error: error.message,
    });
  }
};

// Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    await blog.destroy();
    clearCachedValue("blogs:");
    clearCachedValue("destinations:list");

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting blog",
      error: error.message,
    });
  }
};

// Get Blogs by Destination
export const getBlogsByDestination = async (req, res) => {
  try {
    const { destinationId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const cacheKey = `${BLOG_DESTINATION_CACHE_PREFIX}${JSON.stringify({
      destinationId,
      page: pageNumber,
      limit: limitNumber,
    })}`;

    const cachedResponse = getCachedValue(cacheKey);
    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }

    // Check if destination exists
    const destination = await Destination.findByPk(destinationId);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    const offset = (pageNumber - 1) * limitNumber;

    const { count, rows } = await Blog.findAndCountAll({
      where: { destinationId },
      limit: limitNumber,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const response = {
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(count / limitNumber),
      },
    };

    setCachedValue(cacheKey, response, BLOG_CACHE_TTL_MS);
    res.status(200).json(response);
  } catch (error) {
    console.error("Get Blogs by Destination Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blogs",
      error: error.message,
    });
  }
};

export default {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  getBlogsByDestination,
};
