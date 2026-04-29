import type { Types } from "mongoose";
import type { BaseDocument } from "../common.js";

export type Transmission = "Manuelle" | "Automatique" | "CVT" | "Dual-Clutch";
export type FuelType = "Essence" | "Diesel" | "Hybride" | "Electrique";

export type CarFeature =
  | "Climatisation Auto"
  | "Caméra de Recul"
  | "Android Auto/Apple CarPlay"
  | "Toit Panoramique"
  | "Sièges Cuir"
  | "Régulateur de Vitesse"
  | "Capteurs de Stationnement"
  | "Jantes Alliage"
  | "ESP"
  | "ABS"
  | "Airbags Multiples"
  | "Démarrage sans Clé";

export interface ICarModel extends BaseDocument {
  brand: Types.ObjectId;
  name: string;
  nameAr: string;
  category: Types.ObjectId;
  year: number;
  generation: string;
  engine: string;
  horsepower: number;
  torque: string;
  transmission: Transmission;
  fuelType: FuelType;
  fuelConsumption: string;
  seats: number;
  doors: number;
  features: CarFeature[];
  priceRangeDZD: { min: number; max: number };
  popularity: number;
  isActive: boolean;
  description: string;
  images: string[];
}
