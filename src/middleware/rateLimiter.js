import rateLimit from "express-rate-limit";

const PUBLIC_READ_PATHS = [
  "/api/v1/packages",
  "/api/v1/package-config",
  "/api/v1/destinations",
  "/api/v1/blog",
  "/api/v1/whatsapp-flows/active",
  "/api/v1/image-banners/active",
  "/api/v1/reviews/active",
  "/api/v1/team-members/active",
];

const isPublicReadRequest = (req) => {
  if (req.method !== "GET") return false;
  return PUBLIC_READ_PATHS.some((path) => req.originalUrl.startsWith(path));
};

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Keep protection for non-public/API write routes
  skip: isPublicReadRequest,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
});

export const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 5 submissions per hour
  message: {
    success: false,
    message:
      "Too many submissions from this IP, please try again after an hour",
  },
});
