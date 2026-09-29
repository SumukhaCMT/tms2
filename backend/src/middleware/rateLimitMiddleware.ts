import rateLimit from "express-rate-limit"

// ============================
// General API Rate Limit
// ============================

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
})

// ============================
// Authentication Rate Limit
// ============================

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again later.",
  },
})

// ============================
// Write API Rate Limit
// POST / PUT / DELETE
// ============================

export const writeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 3000,
  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
})