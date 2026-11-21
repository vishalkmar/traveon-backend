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

// Viewing one document = 1 session + 1 stream, so this is generous for a
// real reader but shuts down anyone scripting the endpoint.
export const secureDocLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many document requests, please try again later",
  },
});

// Admin sign-in and 2FA code checks: enough for a person who mistypes,
// far too few for anyone guessing passwords or 6-digit codes.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many sign-in attempts. Please try again after 15 minutes.",
  },
});

// The AI document check calls a paid external API (Gemini). This stops anyone
// from scripting the public endpoint to run up the bill.
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many document checks from this IP. Please try again later.",
  },
});

// Tight limiter for 2FA code checks — a 6-digit code must not be brute-forced.
export const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification attempts. Please try again later.",
  },
});

export const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 submissions per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many submissions from this IP, please try again after an hour",
  },
});
