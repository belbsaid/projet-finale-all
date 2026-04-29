import z from "zod/v4";

/**
 * Strong password schema:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 */
const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

/**
 * Algerian phone number format: +213 followed by 9 digits.
 * Accepts optional spaces/dashes between groups.
 * Examples: +213 555 12 34 56, +213555123456, +213-555-12-34-56
 */
const algerianPhoneSchema = z
  .string()
  .trim()
  .regex(
    /^\+213[\s-]?\d{2,3}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}$/,
    "Phone must be in Algerian format: +213 XXX XX XX XX",
  );

export const loginSchema = z.object({
  email: z.email("Email must be a valid email address").trim().toLowerCase(),
  password: strongPasswordSchema,
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z.email("Email must be a valid email address").trim().toLowerCase(),
  password: strongPasswordSchema,
  phone: algerianPhoneSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: strongPasswordSchema,
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
