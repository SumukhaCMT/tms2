import { z } from "zod";

export const tokenSchema = z.object({
  temple_id: z
    .number()
    .int()
    .positive("Please select a temple."),

  token_name: z
    .string()
    .trim()
    .min(2, "Token name must contain at least 2 characters.")
    .max(100, "Token name cannot exceed 100 characters."),

  token_description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters."),

  seva_id: z
    .number()
    .int()
    .positive("Please select a valid seva.")
    .nullable(),
max_limit: z
  .number()
  .int("Maximum tokens must be a whole number.")
  .min(1, "Maximum tokens must be at least 1.")
  .max(65535, "Maximum tokens cannot exceed 65535.")
  .nullable()
  .optional(),
  deity_id: z
    .number()
    .int()
    .positive("Please select a valid deity.")
    .nullable(),

  token_display_order: z
    .number()
    .int()
    .min(0, "Display order cannot be negative.")
    .max(65535, "Display order cannot exceed 65535."),

  token_status: z.enum(["active", "inactive"]),
});

export type TokenFormData = z.infer<typeof tokenSchema>;