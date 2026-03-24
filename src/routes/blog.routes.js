const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  getBlogsByDestination,
} = require("../controller/blog.controller");
const {
  validateCreateBlog,
  validateUpdateBlog,
  handleValidationErrors,
} = require("../validation/blog.validation");

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

module.exports = router;
