import { Model, model, Schema } from "mongoose";
import type { ILead } from "../types/models/lead.js";

const leadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    interestedModel: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Visited Store", "Sold", "Lost"],
      default: "New",
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        date: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
        note: { type: String },
      },
    ],
    source: {
      type: String,
      enum: ["Website Form", "WhatsApp", "Meeting Booking"],
      default: "Website Form",
    },
    carId: {
      type: Schema.Types.ObjectId,
      ref: "Car",
      default: null,
    },
    reservationDate: {
      type: Date,
      default: null,
    },
    reservationTimeSlot: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
      default: null,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  },
);

leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ reservationDate: 1, reservationTimeSlot: 1 });

const LeadModel: Model<ILead> = model<ILead>("Lead", leadSchema);

export default LeadModel;
