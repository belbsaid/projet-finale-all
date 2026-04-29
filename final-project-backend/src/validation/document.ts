import z from "zod/v4";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const uploadDocumentSchema = z.object({
  carId: objectIdSchema,
  type: z.enum(["COC", "invoice", "customs", "bill_of_lading"]),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
