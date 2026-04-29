import rateLimit from "express-rate-limit";

/**
 * Strict limiter for authentication endpoints (login / register).
 * 10 requests per 15-minute window per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Too many attempts, please try again after 15 minutes" },
  },
});

/**
 * Moderate limiter for public form submissions (lead creation).
 * 30 requests per 15-minute window per IP.
 */
export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Too many requests, please try again later" },
  },
});

/**
 * General API limiter applied to all /api routes.
 * 100 requests per 15-minute window per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Rate limit exceeded, please try again later" },
  },
});
