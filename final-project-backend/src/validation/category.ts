import z from "zod/v4";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
  nameAr: z.string().trim().default(""),
  description: z.string().default(""),
  icon: z.string().default(""),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
