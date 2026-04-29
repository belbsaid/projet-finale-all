import type { Types } from "mongoose";
import type { BaseDocument } from "../common.js";

export type DocumentType = "COC" | "invoice" | "customs" | "bill_of_lading";

export interface IDocument extends BaseDocument {
  car: Types.ObjectId;
  type: DocumentType;
  name: string;
  url: string;
  uploadedBy: Types.ObjectId;
}
