import { NextFunction, Request, Response } from "express";
import { prettifyError, ZodSchema } from "zod/v4";

/**
 * Middleware factory: validates req.body against a Zod schema.
 * Sets req.body to the parsed (sanitized) data on success.
 */
export function validateBodySchema<T>(schema: ZodSchema<T>) {
  return async function (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const parsed = schema.safeParse(req.body);
    if (parsed.success) {
      req.body = parsed.data;
      next();
    } else {
      res.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          details: prettifyError(parsed.error),
        },
      });
    }
  };
}

/**
 * Middleware factory: validates req.query against a Zod schema.
 * Overwrites req.query with the parsed (coerced/transformed) data on success.
 */
export function validateQuerySchema<T>(schema: ZodSchema<T>) {
  return async function (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const parsed = schema.safeParse(req.query);
    if (parsed.success) {
      // req.query is read-only in some Express versions, so mutate in-place
      const q = req.query;
      for (const key of Object.keys(q)) {
        delete q[key];
      }
      Object.assign(q, parsed.data as Record<string, unknown>);
      next();
    } else {
      res.status(400).json({
        success: false,
        error: {
          message: "Invalid query parameters",
          details: prettifyError(parsed.error),
        },
      });
    }
  };
}
