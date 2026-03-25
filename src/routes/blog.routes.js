import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  getBlogsByDestination,
} from "../controller/blog.controller.js";
import {
  validateCreateBlog,
  validateUpdateBlog,
  handleValidationErrors,
} from "../validation/blog.validation.js";

const router = express.Router();

// Public routes
router.get("/", getAllBlogs);
router.get("/slug/:slug", getBlogBySlug);
router.get("/destination/:destinationId", getBlogsByDestination);
router.get("/:id", getBlogById);

// Admin routes (require authentication and admin role)
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateCreateBlog,
  handleValidationErrors,
  createBlog
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateUpdateBlog,
  handleValidationErrors,
  updateBlog
);
router.delete("/:id", authenticate, authorize("admin"), deleteBlog);

export default router;
