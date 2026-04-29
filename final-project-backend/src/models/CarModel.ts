import { Model, model, Schema } from "mongoose";
import type { ICarModel } from "../types/models/carModel.js";

const carModelSchema = new Schema<ICarModel>(
  {
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameAr: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    year: {
      type: Number,
      required: false,
      default: new Date().getFullYear(),
      min: 2015,
      max: 2030,
    },
    generation: {
      type: String,
      default: "",
      trim: true,
    },
    engine: {
      type: String,
      required: true,
      trim: true,
      default: "1.5L Turbo",
    },
    horsepower: {
      type: Number,
      default: 0,
    },
    torque: {
      type: String,
      default: "",
    },
    transmission: {
      type: String,
      enum: ["Manuelle", "Automatique", "CVT", "Dual-Clutch"],
      default: "Automatique",
    },
    fuelType: {
      type: String,
      enum: ["Essence", "Diesel", "Hybride", "Electrique"],
      default: "Essence",
    },
    fuelConsumption: {
      type: String,
      default: "7.0L/100km",
    },
    seats: {
      type: Number,
      default: 5,
      min: 2,
      max: 8,
    },
    doors: {
      type: Number,
      default: 5,
      min: 2,
      max: 5,
    },
    features: [
      {
        type: String,
        enum: [
          "Climatisation Auto",
          "Caméra de Recul",
          "Android Auto/Apple CarPlay",
          "Toit Panoramique",
          "Sièges Cuir",
          "Régulateur de Vitesse",
          "Capteurs de Stationnement",
          "Jantes Alliage",
          "ESP",
          "ABS",
          "Airbags Multiples",
          "Démarrage sans Clé",
        ],
      },
    ],
    priceRangeDZD: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    popularity: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: "",
    },
    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  },
);

carModelSchema.index({ brand: 1, category: 1 });
carModelSchema.index({ year: -1, popularity: -1 });

const CarModelModel: Model<ICarModel> = model<ICarModel>(
  "CarModel",
  carModelSchema,
);

export default CarModelModel;
