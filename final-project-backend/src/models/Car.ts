import { Model, model, Schema } from "mongoose";
import type { ICar } from "../types/models/car.js";

const carSchema = new Schema<ICar>(
  {
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    model: {
      type: Schema.Types.ObjectId,
      ref: "CarModel",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    year: {
      type: Number,
      required: true,
      min: 2015,
      max: 2030,
    },

    // Identification
    vin: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
      match: /^[A-HJ-NPR-Z0-9]{17}$/,
    },
    stockNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      uppercase: true,
    },

    // Physical attributes
    color: {
      type: String,
      required: true,
      trim: true,
    },
    colorCode: {
      type: String,
      default: "",
      trim: true,
    },
    mileage: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Pricing
    costPriceDZD: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPriceDZD: {
      type: Number,
      required: true,
      min: 0,
    },
    discountDZD: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalPriceDZD: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Status tracking
    status: {
      type: String,
      enum: [
        "In Transit",
        "In Stock",
        "Reserved",
        "Sold",
        "Maintenance",
        "Damaged",
      ],
      default: "In Transit",
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        date: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: "User" },
        note: { type: String },
      },
    ],
    arrivalDate: {
      type: Date,
      default: null,
    },
    expectedDeliveryDate: {
      type: Date,
      default: null,
    },
    soldDate: {
      type: Date,
      default: null,
    },

    // Specifications
    specs: {
      engine: { type: String, default: "" },
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
      fuelConsumption: { type: String, default: "" },
      warranty: { type: String, default: "3 ans / 100 000 km" },
    },

    features: [{ type: String }],
    photos: [{ type: String }],
    videos: [{ type: String }],

    documents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Document",
      },
    ],

    internalNotes: {
      type: String,
      default: "",
    },
    customerNotes: {
      type: String,
      default: "",
    },

    // Customer link
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Audit
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true },
  },
);

// Virtual: profit margin percentage
carSchema.virtual("profitMargin").get(function () {
  if (!this.costPriceDZD || !this.sellingPriceDZD) return 0;
  return ((this.sellingPriceDZD - this.costPriceDZD) / this.costPriceDZD) * 100;
});

// Virtual: is currently discounted?
carSchema.virtual("isDiscounted").get(function () {
  return this.discountDZD > 0;
});

// Pre-save: compute final price
carSchema.pre("save", function () {
  this.finalPriceDZD = this.sellingPriceDZD - this.discountDZD;
});

carSchema.index({ status: 1, brand: 1 });
carSchema.index({ createdAt: -1 });
carSchema.index({ customerId: 1, status: 1 });

const CarModel: Model<ICar> = model<ICar>("Car", carSchema);

export default CarModel;
