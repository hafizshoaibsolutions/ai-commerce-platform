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

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
