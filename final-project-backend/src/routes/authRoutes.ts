import { Router } from "express";
import {
  register,
  login,
  getMe,
  changePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validateBodySchema } from "../middleware/validations.js";
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
} from "../validation/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";

const authRouter = Router();

/**
 * POST /api/auth/register
 * Public — creates a new "user" account
 */
authRouter.post(
  "/register",
  authLimiter,
  validateBodySchema(registerSchema),
  register,
);

/**
 * POST /api/auth/login
 * Public — validates body then calls login controller
 */
authRouter.post("/login", authLimiter, validateBodySchema(loginSchema), login);

/**
 * GET /api/auth/me
 * Protected — requires valid Bearer token
 */
authRouter.get("/me", protect, getMe);

/**
 * PUT /api/auth/password
 * Protected — change password (requires current password)
 */
authRouter.put(
  "/password",
  protect,
  validateBodySchema(changePasswordSchema),
  changePassword,
);

export default authRouter;
