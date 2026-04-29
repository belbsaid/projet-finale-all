import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import UserModel from "../models/User.js";
import {
  getPaginationOptions,
  buildPaginationMeta,
} from "../utils/pagination.js";

/**
 * GET /api/users
 * Admin only — list all users with optional role filter.
 * Supports pagination: ?page=1&limit=10
 */
export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const { role } = req.query;

    const query: Record<string, unknown> = {};
    if (role && (role === "admin" || role === "user")) {
      query.role = role;
    }

    const { page, limit, skip } = getPaginationOptions(
      req.query as Record<string, unknown>,
    );
    const total = await UserModel.countDocuments(query);
    const users = await UserModel.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(StatusCodes.OK).json({
      success: true,
      pagination: buildPaginationMeta(page, limit, total),
      users,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Server error",
      },
    });
  }
}

/**
 * GET /api/users/:id
 * Admin only — single user by ID (excludes password).
 */
export async function getUser(req: Request, res: Response): Promise<void> {
  try {
    const user = await UserModel.findById(req.params.id).select("-password");

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "User not found" },
      });
      return;
    }
    res.status(StatusCodes.OK).json({ success: true, user });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Server error",
      },
    });
  }
}
