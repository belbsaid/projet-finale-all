import z from "zod/v4";

const algerianPhoneSchema = z
  .string()
  .trim()
  .regex(
    /^\+213[\s-]?\d{2,3}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}$/,
    "Phone must be in Algerian format: +213 XXX XX XX XX",
  );

export const createLeadSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: algerianPhoneSchema,
  email: z.email("Invalid email").trim().toLowerCase().optional(),
  message: z.string().trim().default(""),
  interestedModel: z.string().trim().min(1, "Interested model is required"),
  carId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid car ID").optional(),
  source: z.enum(["Website Form", "WhatsApp"]).default("Website Form"),
  reservationDate: z.string().min(1, "Reservation date is required").optional(),
  reservationTimeSlot: z.enum(["morning", "afternoon", "evening"]).optional(),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(["New", "Contacted", "Visited Store", "Sold", "Lost"]),
  carId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid car ID")
    .optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const meetingBookingSchema = z.object({
  carId: objectIdSchema,
  preferredDate: z
    .string()
    .min(1, "preferredDate is required"),
  preferredTimeSlot: z.enum(["morning", "afternoon", "evening"]),
  notes: z.string().optional(),
});

export type MeetingBookingInput = z.infer<typeof meetingBookingSchema>;

export const getLeadsQuerySchema = z
  .object({
    status: z
      .enum(["New", "Contacted", "Visited Store", "Sold", "Lost"])
      .optional(),
    carId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid car ID").optional(),
    since: z
      .string()
      .regex(/^\d+$/, "since must be a number of days")
      .optional(),
    page: z.string().regex(/^\d+$/, "page must be a number").optional(),
    limit: z.string().regex(/^\d+$/, "limit must be a number").optional(),
  })
  .passthrough();

export type GetLeadsQueryInput = z.infer<typeof getLeadsQuerySchema>;
