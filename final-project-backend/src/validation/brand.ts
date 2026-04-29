import z from "zod/v4";

export const createBrandSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required"),
  origin: z
    .enum(["China", "Japan", "Germany", "France", "Korea", "USA", "Other"])
    .default("China"),
  logo: z.string().default(""),
  description: z.string().default(""),
  isActive: z.boolean().default(true),
  popularity: z.number().int().min(0).max(100).default(0),
  warrantyYears: z.number().int().min(1).default(3),
  hasLocalServiceCenter: z.boolean().default(false),
  website: z.string().default(""),
});

export const updateBrandSchema = createBrandSchema.partial();

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
