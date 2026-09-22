import { z } from "zod";

/**
 * Mirrors backend/src/validators/auth.validation.ts and user.validation.ts.
 *
 * These schemas are the client half of the server contract: the same rules, so
 * users get feedback before a round-trip. The server still validates — these
 * are UX, not enforcement.
 */

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .pipe(z.email("Enter a valid email address"));

const password = z
  .string()
  .min(8, "Password must be at least 8 characters long");

const confirmPassword = z.string().min(1, "Confirm your password");

export const loginSchema = z.object({
  email,
  password,
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters long")
      .max(50, "Name cannot exceed 50 characters"),
    email,
    password,
    confirmPassword,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email,
});

/** Mirrors the backend's resend-verification body: an email address and nothing else. */
export const resendVerificationSchema = z.object({
  email,
});

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Mirrors the backend's update schema, which accepts any subset but rejects an
 * empty body. Empty strings are treated as "clear this field" and mapped to
 * `undefined` when the payload is built.
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name cannot exceed 50 characters"),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || value.length >= 7,
      "Phone must be at least 7 characters long",
    )
    .refine(
      (value) => value === "" || value.length <= 20,
      "Phone cannot exceed 20 characters",
    ),
  avatar_url: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || z.url().safeParse(value).success,
      "Enter a valid URL including https://",
    ),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResendVerificationSchema = z.infer<
  typeof resendVerificationSchema
>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
