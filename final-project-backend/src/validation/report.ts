import z from "zod/v4";

export const revenueQuerySchema = z.object({
  month: z
    .string()
    .regex(/^([1-9]|1[0-2])$/, "month must be 1–12")
    .transform(Number),
  year: z
    .string()
    .regex(/^\d{4}$/, "year must be a 4-digit number")
    .transform(Number),
});

export type RevenueQueryInput = z.infer<typeof revenueQuerySchema>;
