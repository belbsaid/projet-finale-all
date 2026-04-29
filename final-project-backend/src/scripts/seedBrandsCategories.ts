import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env from the backend root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import BrandModel from "../models/Brand.js";
import CategoryModel from "../models/Category.js";

const BRANDS: { name: string; origin: string }[] = [
  { name: "Audi", origin: "Germany" },
  { name: "BMW", origin: "Germany" },
  { name: "Mercedes-Benz", origin: "Germany" },
  { name: "Volkswagen", origin: "Germany" },
  { name: "Porsche", origin: "Germany" },
  { name: "Opel", origin: "Germany" },
  { name: "Mini", origin: "Germany" },
  { name: "Toyota", origin: "Japan" },
  { name: "Honda", origin: "Japan" },
  { name: "Nissan", origin: "Japan" },
  { name: "Mazda", origin: "Japan" },
  { name: "Subaru", origin: "Japan" },
  { name: "Suzuki", origin: "Japan" },
  { name: "Mitsubishi", origin: "Japan" },
  { name: "Lexus", origin: "Japan" },
  { name: "Hyundai", origin: "Korea" },
  { name: "Kia", origin: "Korea" },
  { name: "Genesis", origin: "Korea" },
  { name: "Ford", origin: "USA" },
  { name: "Chevrolet", origin: "USA" },
  { name: "Jeep", origin: "USA" },
  { name: "Tesla", origin: "USA" },
  { name: "Peugeot", origin: "France" },
  { name: "Renault", origin: "France" },
  { name: "Citroën", origin: "France" },
  { name: "BYD", origin: "China" },
  { name: "Chery", origin: "China" },
  { name: "Geely", origin: "China" },
  { name: "Haval", origin: "China" },
  { name: "MG", origin: "China" },
  { name: "Dacia", origin: "Other" },
  { name: "Fiat", origin: "Other" },
  { name: "Alfa Romeo", origin: "Other" },
  { name: "Maserati", origin: "Other" },
  { name: "Jaguar", origin: "Other" },
  { name: "Land Rover", origin: "Other" },
  { name: "Volvo", origin: "Other" },
  { name: "Seat", origin: "Other" },
  { name: "Škoda", origin: "Other" },
  { name: "Cupra", origin: "Other" },
];

const CATEGORIES: { name: string; description: string }[] = [
  { name: "Sedan", description: "Classic four-door passenger car" },
  { name: "SUV", description: "Sport Utility Vehicle" },
  { name: "Hatchback", description: "Compact car with rear door" },
  { name: "Coupe", description: "Two-door sporty vehicle" },
  { name: "Convertible", description: "Open-top / cabriolet" },
  { name: "Pickup Truck", description: "Truck with open cargo bed" },
  { name: "Van", description: "Cargo or passenger van" },
  { name: "Minivan", description: "Multi-purpose family vehicle" },
  { name: "Wagon", description: "Station wagon / estate car" },
  { name: "Crossover", description: "Compact SUV / crossover style" },
  { name: "Sport", description: "Performance / sports car" },
  { name: "Luxury", description: "Premium luxury vehicle" },
  { name: "Electric", description: "Fully electric vehicle" },
  { name: "Hybrid", description: "Hybrid electric vehicle" },
  { name: "Off-Road", description: "4x4 off-road capable vehicle" },
  { name: "Commercial", description: "Commercial / utility vehicle" },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found in .env");
    process.exit(1);
  }

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME,
    auth: {
      username: process.env.MONGODB_USERNAME,
      password: process.env.MONGODB_PASSWORD,
    },
  });
  console.log("Connected to MongoDB");

  // --- Seed Brands ---
  let brandCreated = 0;
  let brandSkipped = 0;
  for (const b of BRANDS) {
    const exists = await BrandModel.findOne({
      name: { $regex: new RegExp(`^${b.name}$`, "i") },
    });
    if (!exists) {
      await BrandModel.create(b);
      brandCreated++;
      console.log(`  ✓ Brand: ${b.name}`);
    } else {
      brandSkipped++;
    }
  }
  console.log(
    `Brands: ${brandCreated} created, ${brandSkipped} already existed`,
  );

  // --- Seed Categories ---
  let catCreated = 0;
  let catSkipped = 0;
  for (const c of CATEGORIES) {
    const exists = await CategoryModel.findOne({
      name: { $regex: new RegExp(`^${c.name}$`, "i") },
    });
    if (!exists) {
      await CategoryModel.create(c);
      catCreated++;
      console.log(`  ✓ Category: ${c.name}`);
    } else {
      catSkipped++;
    }
  }
  console.log(
    `Categories: ${catCreated} created, ${catSkipped} already existed`,
  );

  await mongoose.disconnect();
  console.log("Done!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
