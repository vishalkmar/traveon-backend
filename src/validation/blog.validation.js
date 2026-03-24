const { body, validationResult } = require("express-validator");

// Validation for creating a blog
exports.validateCreateBlog = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  
  body("destinationId")
    .notEmpty()
    .withMessage("Destination ID is required")
    .isUUID()
    .withMessage("Invalid destination ID"),
  
  body("images")
    .notEmpty()
    .withMessage("At least one image is required")
    .isArray({ min: 1 })
    .withMessage("Images must be an array with at least 1 image")
    .custom((value) => {
      if (!value.every(img => typeof img === 'string' && img.length > 0)) {
        throw new Error("All images must be non-empty strings");
      }
      return true;
    }),
  
  body("excerpt")
    .trim()
    .notEmpty()
    .withMessage("Excerpt is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Excerpt must be between 10 and 500 characters"),
  
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 50 })
    .withMessage("Content must be at least 50 characters"),
  
  body("author")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Author name must not exceed 100 characters"),
  
  body("category")
    .optional()
    .trim()
    .isIn(["Travel", "Culture", "Adventure", "Guide", "Tips", "Experience"])
    .withMessage("Invalid category"),
  
  body("readTime")
    .optional()
    .trim()
    .matches(/^\d+\s+min\s+read$/)
    .withMessage("Read time format should be like '5 min read'"),
  
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),
];

// Validation for updating a blog
exports.validateUpdateBlog = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  
  body("destinationId")
    .optional()
    .isUUID()
    .withMessage("Invalid destination ID"),
  
  body("images")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Images must be an array with at least 1 image")
    .custom((value) => {
      if (!value.every(img => typeof img === 'string' && img.length > 0)) {
        throw new Error("All images must be non-empty strings");
      }
      return true;
    }),
  
  body("excerpt")
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Excerpt must be between 10 and 500 characters"),
  
  body("content")
    .optional()
    .trim()
    .isLength({ min: 50 })
    .withMessage("Content must be at least 50 characters"),
  
  body("author")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Author name must not exceed 100 characters"),
  
  body("category")
    .optional()
    .trim()
    .isIn(["Travel", "Culture", "Adventure", "Guide", "Tips", "Experience"])
    .withMessage("Invalid category"),
  
  body("readTime")
    .optional()
    .trim()
    .matches(/^\d+\s+min\s+read$/)
    .withMessage("Read time format should be like '5 min read'"),
  
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),
];

// Middleware to handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};
