import { Model, model, Schema } from "mongoose";
import type { ICategory } from "../types/models/category.js";

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nameAr: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  },
);

categorySchema.index({ sortOrder: 1 });

const CategoryModel: Model<ICategory> = model<ICategory>(
  "Category",
  categorySchema,
);

export default CategoryModel;
