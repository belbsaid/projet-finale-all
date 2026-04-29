import { Model, model, Schema } from "mongoose";
import type { IBrand } from "../types/models/brand.js";

const brandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    origin: {
      type: String,
      required: true,
      default: "China",
      enum: ["China", "Japan", "Germany", "France", "Korea", "USA", "Other"],
    },
    logo: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    popularity: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    warrantyYears: {
      type: Number,
      default: 3,
      min: 1,
    },
    hasLocalServiceCenter: {
      type: Boolean,
      default: false,
    },
    website: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  },
);

brandSchema.index({ origin: 1, isActive: 1 });

const BrandModel: Model<IBrand> = model<IBrand>("Brand", brandSchema);

export default BrandModel;
