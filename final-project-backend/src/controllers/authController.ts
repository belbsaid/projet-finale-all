import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import UserModel from "../models/User.js";
import type { AuthenticatedRequest } from "../types/express.js";

/**
 * POST /api/auth/register
 * Creates a new user account with the "user" role.
 * Admins are seeded — they cannot self-register.
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, phone } = req.body as {
      name: string;
      email: string;
      password: string;
      phone: string;
    };

    // Check if email is already taken
    const existingUser = await UserModel.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        error: { message: "Email already in use" },
      });
      return;
    }

    // Create user — role defaults to "user" via schema
    const user = await UserModel.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      // role is NOT accepted from the request body — always "user"
    });

    // Sign JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRE } as jwt.SignOptions,
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "An error occurred",
      },
    });
  }
}

/**
 * POST /api/auth/login
 * Validates credentials and returns a signed JWT.
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };

    // Find user by email (case-insensitive — stored as lowercase)
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: { message: "Invalid credentials" },
      });
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: { message: "Invalid credentials" },
      });
      return;
    }

    // Sign JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRE } as jwt.SignOptions,
    );

    res.status(StatusCodes.OK).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "An error occurred",
      },
    });
  }
}

/**
 * GET /api/auth/me
 * Protected route — req.user is populated by the `protect` middleware.
 * Returns the authenticated user's profile.
 */
export function getMe(req: Request, res: Response): void {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.user) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: { message: "Not authorized" },
    });
    return;
  }

  res.status(StatusCodes.OK).json({
    success: true,
    user: {
      id: authReq.user.id,
      name: authReq.user.name,
      email: authReq.user.email,
      phone: authReq.user.phone,
      role: authReq.user.role,
    },
  });
}

/**
 * PUT /api/auth/password
 * Protected — change the authenticated user's password.
 * Validates current password before accepting the new one.
 */
export async function changePassword(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };

    const user = await UserModel.findById(authReq.user.id);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "User not found" },
      });
      return;
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: { message: "Current password is incorrect" },
      });
      return;
    }

    user.password = newPassword;
    await user.save(); // pre-save hook hashes the new password

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "An error occurred",
      },
    });
  }
}
