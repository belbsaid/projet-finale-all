import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ActivityModel from "../models/Activity.js";

/**
 * GET /api/activities?limit=30
 * Admin only — returns the most recent activity log entries.
 */
export async function getActivities(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const limit = Math.min(Number(req.query.limit) || 30, 100);

    const activities = await ActivityModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(StatusCodes.OK).json({
      success: true,
      count: activities.length,
      activities,
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
