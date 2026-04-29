import type { Types } from "mongoose";
import type { BaseDocument } from "../common.js";

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Visited Store"
  | "Sold"
  | "Lost";

export type LeadSource = "Website Form" | "WhatsApp" | "Meeting Booking";

export interface ILeadStatusChange {
  status: string;
  date: Date;
  changedBy?: Types.ObjectId | null;
  note?: string;
}

export type ReservationTimeSlot = "morning" | "afternoon" | "evening";

export interface ILead extends BaseDocument {
  name: string;
  phone: string;
  email: string;
  message: string;
  interestedModel: string;
  status: LeadStatus;
  statusHistory: ILeadStatusChange[];
  source: LeadSource;
  carId: Types.ObjectId | null;
  submittedBy: Types.ObjectId | null;
  reservationDate: Date | null;
  reservationTimeSlot: ReservationTimeSlot | null;
}
