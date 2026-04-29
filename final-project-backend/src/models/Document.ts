import { Model, model, Schema } from "mongoose";
import type { IDocument } from "../types/models/document.js";

const documentSchema = new Schema<IDocument>(
  {
    car: {
      type: Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    type: {
      type: String,
      enum: ["COC", "invoice", "customs", "bill_of_lading"],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  },
);

documentSchema.index({ car: 1 });

const DocumentModel: Model<IDocument> = model<IDocument>(
  "Document",
  documentSchema,
);

export default DocumentModel;
