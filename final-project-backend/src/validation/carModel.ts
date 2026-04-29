import z from "zod/v4";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const featureEnum = z.enum([
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
]);

export const createCarModelSchema = z.object({
  brand: objectIdSchema,
  name: z.string().trim().min(1, "Model name is required"),
  nameAr: z.string().trim().default(""),
  category: objectIdSchema,
  year: z.number().int().min(2015).max(2030),
  generation: z.string().trim().default(""),
  engine: z.string().trim().default("1.5L Turbo"),
  horsepower: z.number().int().min(0).default(0),
  torque: z.string().default(""),
  transmission: z
    .enum(["Manuelle", "Automatique", "CVT", "Dual-Clutch"])
    .default("Automatique"),
  fuelType: z
    .enum(["Essence", "Diesel", "Hybride", "Electrique"])
    .default("Essence"),
  fuelConsumption: z.string().default("7.0L/100km"),
  seats: z.number().int().min(2).max(8).default(5),
  doors: z.number().int().min(2).max(5).default(5),
  features: z.array(featureEnum).default([]),
  priceRangeDZD: z
    .object({
      min: z.number().min(0).default(0),
      max: z.number().min(0).default(0),
    })
    .default({ min: 0, max: 0 }),
  popularity: z.number().int().min(0).max(100).default(0),
  isActive: z.boolean().default(true),
  description: z.string().default(""),
  images: z.array(z.string()).default([]),
});

export const updateCarModelSchema = createCarModelSchema.partial();

export type CreateCarModelInput = z.infer<typeof createCarModelSchema>;
export type UpdateCarModelInput = z.infer<typeof updateCarModelSchema>;
