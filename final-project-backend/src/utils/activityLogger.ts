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
  const doc: {
    type: string;
    title: string;
    description: string;
    entityId?: Types.ObjectId | string;
    entityType?: LogActivityParams["entityType"];
    performedBy?: Types.ObjectId | string;
  } = {
    type: params.type,
    title: params.title,
    description: params.description ?? "",
  };

  if (params.entityId) doc.entityId = params.entityId;
  if (params.entityType) doc.entityType = params.entityType;
  if (params.performedBy) doc.performedBy = params.performedBy;

  ActivityModel.create(doc).catch((err) => {
    logger.error("Failed to log activity", {
      error: err instanceof Error ? err.message : String(err),
      activityType: params.type,
    });
  });
}
