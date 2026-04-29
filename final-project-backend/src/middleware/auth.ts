import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import type { AuthenticatedRequest } from "../types/express.js";
import UserModel from "../models/User.js";

interface JwtPayload {
  userId: string;
  name: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * `protect` middleware
 * Extracts and verifies the Bearer JWT token.
 * Attaches { id, email, role } to req.user on success.
 */
export async function protect(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: { message: "Not authorized" },
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: { message: "Not authorized" },
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    // Fetch user from DB to get fields not stored in JWT (e.g. phone)
    const user = await UserModel.findById(decoded.userId).select(
      "name email phone role",
    );
    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: { message: "User no longer exists" },
      });
      return;
    }

    (req as AuthenticatedRequest).user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: { message: "Not authorized" },
    });
  }
}

/**
 * `optionalAuth` middleware
 * Similar to protect, but does not reject if a token is missing/invalid.
 * Useful for public routes that return more data to admins.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET as string,
        ) as JwtPayload;
        const user = await UserModel.findById(decoded.userId).select("role");
        if (user) {
          (req as AuthenticatedRequest).user = {
            id: user._id.toString(),
            name: "",
            email: "",
            phone: "",
            role: user.role,
          };
        }
      }
    }
  } catch (error) {
    // Ignore invalid token
  }
  next();
}

/**
 * `authorize(...roles)` middleware factory
 * Must be used AFTER `protect`.
 * Returns 403 if the authenticated user's role is not in the allowed list.
 */
export function authorize(...roles: string[]) {
  return function (req: Request, res: Response, next: NextFunction): void {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user || !roles.includes(authReq.user.role)) {
      res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        error: { message: "Not authorized to access this route" },
      });
      return;
    }

    next();
  };
}
