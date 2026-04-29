import ActivityModel from "../models/Activity.js";
import type { Types } from "mongoose";
import { logger } from "./logger.js";

interface LogActivityParams {
  type: string;
  title: string;
  description?: string;
  entityId?: Types.ObjectId | string;
  entityType?: "car" | "lead" | "brand" | "model" | "category";
  performedBy?: Types.ObjectId | string;
}

/**
 * Fire-and-forget activity logger.
 * Inserts an event into the Activity collection without blocking
 * the calling controller. Errors are silently caught and logged.
 */
export function logActivity(params: LogActivityParams): void {
  ActivityModel.create({
    type: params.type,
    title: params.title,
    description: params.description ?? "",
    entityId: params.entityId ?? null,
    entityType: params.entityType ?? null,
    performedBy: params.performedBy ?? null,
  }).catch((err) => {
    logger.error("Failed to log activity", {
      error: err instanceof Error ? err.message : String(err),
      activityType: params.type,
    });
  });
}
