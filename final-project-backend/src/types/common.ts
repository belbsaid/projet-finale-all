import { Types } from "mongoose";

export interface BaseDocument {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User roles in the car import business platform.
 * - admin: Full access to dashboard (Cars, Leads, Reports, Settings)
 * - user:  Landing page only (view cars, submit leads, contact form)
 */
export type UserRole = "admin" | "user";
