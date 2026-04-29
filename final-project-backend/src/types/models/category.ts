import type { BaseDocument } from "../common.js";

export interface ICategory extends BaseDocument {
  name: string;
  nameAr: string;
  description: string;
  icon: string;
  sortOrder: number;
}
