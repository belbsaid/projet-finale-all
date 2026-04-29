import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { logger } from "../utils/logger.js";

interface MongooseError extends Error {
  code?: number;
  keyPattern?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
  path?: string;
  value?: unknown;
}

/**
 * Global error handling middleware.
 * Must be registered AFTER all routes.
 * Returns consistent JSON: { success: false, error: { message } }
 */
export function errorHandler(
  err: Error | MongooseError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error("Error occurred", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const mongoErr = err as MongooseError;
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: {
        message: mongoErr.errors
          ? Object.values(mongoErr.errors)
              .map((e) => e.message)
              .join(", ")
          : err.message,
      },
    });
    return;
  }

  // Mongoose duplicate key errors
  const mongoErr = err as MongooseError;
  if (mongoErr.code === 11000) {
    const field = mongoErr.keyPattern
      ? Object.keys(mongoErr.keyPattern)[0]
      : "field";
    res.status(StatusCodes.CONFLICT).json({
      success: false,
      error: { message: `Duplicate value for ${field}` },
    });
    return;
  }

  // Mongoose cast errors (invalid ObjectId)
  if (err.name === "CastError") {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: { message: `Invalid ${mongoErr.path}: ${mongoErr.value}` },
    });
    return;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: { message: "Not authorized" },
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: { message: "Token has expired, please login again" },
    });
    return;
  }

  // Default 500
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    },
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
