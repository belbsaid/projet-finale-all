import type { BaseDocument } from "../common.js";

export type BrandOrigin =
  | "China"
  | "Japan"
  | "Germany"
  | "France"
  | "Korea"
  | "USA"
  | "Other";

export interface IBrand extends BaseDocument {
  name: string;
  origin: BrandOrigin;
  logo: string;
  description: string;
  isActive: boolean;
  popularity: number;
  warrantyYears: number;
  hasLocalServiceCenter: boolean;
  website: string;
}
