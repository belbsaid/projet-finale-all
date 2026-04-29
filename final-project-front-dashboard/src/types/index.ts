// ─── Shared Types ────────────────────────────────────────────────────────────

export interface Brand {
  _id: string;
  name: string;
  origin?: string;
  logo?: string;
  warrantyYears?: number;
  hasServiceCenter?: boolean;
  popularity?: number;
  website?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Model {
  _id: string;
  name: string;
  brand: Brand | string;
  category?: Category | string;
  year?: number;
  engine?: string;
  transmission?: string;
  fuelType?: string;
  fuelConsumption?: string;
  warranty?: string;
  features?: string[];
  priceRange?: { min: number; max: number };
  popularity?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CarPhoto {
  _id?: string;
  url: string;
  filename?: string;
}

export interface CarDocument {
  _id: string;
  name: string;
  url: string;
  type?: string;
  size?: number;
  uploadedBy?: string;
  createdAt?: string;
}

export interface StatusChange {
  status: string;
  date: string;
  changedBy?: string;
  note?: string;
}

export interface Car {
  _id: string;
  stockNumber?: string;
  brand: Brand | string;
  model: Model | string;
  category?: Category | string;
  year: number;
  vin: string;
  color: string;
  colorCode?: string;
  mileage?: number;
  status: string;
  costPriceDZD?: number;
  sellingPriceDZD?: number;
  discountDZD?: number;
  finalPriceDZD?: number;
  specs?: {
    engine?: string;
    transmission?: string;
    fuelType?: string;
    fuelConsumption?: string;
    warranty?: string;
  };
  features?: string[];
  photos?: string[] | CarPhoto[];
  documents?: CarDocument[];
  statusHistory?: StatusChange[];
  customer?: {
    name: string;
    phone?: string;
    email?: string;
    purchaseDate?: string;
  };
  expectedDeliveryDate?: string;
  arrivalDate?: string;
  soldDate?: string;
  internalNotes?: string;
  customerNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  interestedModel?: string;
  status: string;
  source?: string;
  message?: string;
  assignedCar?: Car | string;
  statusHistory?: StatusChange[];
  createdAt: string;
  updatedAt?: string;
}

export interface Document {
  _id: string;
  name: string;
  url: string;
  type?: string;
  size?: number;
  car?: {
    _id: string;
    model: { name: string } | string;
    brand?: { name: string } | string;
  };
  uploadedBy?: string;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getBrandName(car: Car): string {
  return typeof car.brand === "object" ? car.brand.name : String(car.brand);
}

export function getModelName(car: Car): string {
  return typeof car.model === "object" ? car.model.name : String(car.model);
}

export function getBrandId(brand: Brand | string): string {
  return typeof brand === "object" ? brand._id : brand;
}

export function getModelId(model: Model | string): string {
  return typeof model === "object" ? model._id : model;
}

export function getCategoryName(cat: Category | string | undefined): string {
  if (!cat) return "—";
  return typeof cat === "object" ? cat.name : String(cat);
}
