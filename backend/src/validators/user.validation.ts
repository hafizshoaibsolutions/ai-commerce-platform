import { z } from "zod";

export const updateUserProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters long")
      .max(50, "Name cannot exceed 50 characters")
      .optional(),
    phone: z
      .string()
      .trim()
      .min(7, "Phone must be at least 7 characters long")
      .max(20, "Phone cannot exceed 20 characters")
      .optional(),
    avatar_url: z.string().trim().url("Invalid URL").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
