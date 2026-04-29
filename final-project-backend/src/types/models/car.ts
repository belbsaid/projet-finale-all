import type { Types } from "mongoose";
import type { BaseDocument } from "../common.js";
import type { Transmission, FuelType } from "./carModel.js";

export type CarStatus =
  | "In Transit"
  | "In Stock"
  | "Reserved"
  | "Sold"
  | "Maintenance"
  | "Damaged";

export interface ICarSpecs {
  engine: string;
  transmission: Transmission;
  fuelType: FuelType;
  fuelConsumption: string;
  warranty: string;
}

export interface IStatusChange {
  status: string;
  date: Date;
  changedBy?: Types.ObjectId;
  note?: string;
}

export interface ICar extends BaseDocument {
  brand: Types.ObjectId;
  model: Types.ObjectId;
  category: Types.ObjectId;
  year: number;
  vin: string;
  stockNumber: string;
  color: string;
  colorCode: string;
  mileage: number;
  costPriceDZD: number;
  sellingPriceDZD: number;
  discountDZD: number;
  finalPriceDZD: number;
  status: CarStatus;
  statusHistory: IStatusChange[];
  arrivalDate: Date | null;
  expectedDeliveryDate: Date | null;
  soldDate: Date | null;
  specs: ICarSpecs;
  features: string[];
  photos: string[];
  videos: string[];
  documents: Types.ObjectId[];
  internalNotes: string;
  customerNotes: string;
  customerId: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
}
