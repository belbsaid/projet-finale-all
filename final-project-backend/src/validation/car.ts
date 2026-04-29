import z from "zod/v4";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const createCarSchema = z.object({
  brand: objectIdSchema,
  model: objectIdSchema,
  category: objectIdSchema,
  year: z.coerce.number().int().min(2015).max(2030),
  vin: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .refine((val) => !val || val === "" || /^[A-HJ-NPR-Z0-9]{17}$/.test(val), {
      message: "Invalid VIN format",
    })
    .transform((val) => (val === "" ? undefined : val)),
  stockNumber: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  color: z.string().trim().min(1, "Color is required"),
  colorCode: z.string().trim().default(""),
  mileage: z.coerce.number().int().min(0).default(0),
  costPriceDZD: z.coerce.number().min(0, "Cost price is required"),
  sellingPriceDZD: z.coerce.number().min(0, "Selling price is required"),
  discountDZD: z.coerce.number().min(0).default(0),
  status: z
    .enum([
      "In Transit",
      "In Stock",
      "Reserved",
      "Sold",
      "Maintenance",
      "Damaged",
    ])
    .default("In Transit"),
  arrivalDate: z
    .union([z.coerce.date(), z.string().transform(() => null)])
    .nullable()
    .optional(),
  expectedDeliveryDate: z
    .union([z.coerce.date(), z.string().transform(() => null)])
    .nullable()
    .optional(),
  specs: z
    .object({
      engine: z.string().optional(),
      transmission: z
        .enum(["Manuelle", "Automatique", "CVT", "Dual-Clutch"])
        .optional(),
      fuelType: z
        .enum(["Essence", "Diesel", "Hybride", "Electrique"])
        .optional(),
      fuelConsumption: z.string().optional(),
      warranty: z.string().optional(),
    })
    .optional(),
  features: z.array(z.string()).optional(),
  photos: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
  internalNotes: z.string().optional(),
  customerNotes: z.string().optional(),
});

export const updateCarSchema = createCarSchema.partial();

export const updateCarStatusSchema = z.object({
  status: z.enum([
    "In Transit",
    "In Stock",
    "Reserved",
    "Sold",
    "Maintenance",
    "Damaged",
  ]),
});

export type CreateCarInput = z.infer<typeof createCarSchema>;
export type UpdateCarInput = z.infer<typeof updateCarSchema>;
export type UpdateCarStatusInput = z.infer<typeof updateCarStatusSchema>;

export const getCarsQuerySchema = z
  .object({
    status: z
      .enum([
        "In Transit",
        "In Stock",
        "Reserved",
        "Sold",
        "Maintenance",
        "Damaged",
      ])
      .optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.string().regex(/^\d+$/, "minPrice must be a number").optional(),
    maxPrice: z.string().regex(/^\d+$/, "maxPrice must be a number").optional(),
    color: z.string().optional(),
    sortBy: z.enum(["price-low", "price-high", "newest", "name"]).optional(),
    page: z.string().regex(/^\d+$/, "page must be a number").optional(),
    limit: z.string().regex(/^\d+$/, "limit must be a number").optional(),
    lang: z.enum(["fr", "ar"]).optional(),
  })
  .passthrough();

export type GetCarsQueryInput = z.infer<typeof getCarsQuerySchema>;
