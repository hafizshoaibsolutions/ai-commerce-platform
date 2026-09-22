import { z } from "zod";

export const registerUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name cannot exceed 50 characters"),
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const loginUserSchema = z.object({
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email address").toLowerCase(),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().email("Invalid email address").toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

export type LoginUserInput = z.infer<typeof loginUserSchema>;

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
