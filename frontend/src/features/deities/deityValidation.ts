import * as z from "zod";

export const deitySchema = z.object({
  temple_id: z
    .number()
    .int("Temple ID must be a whole number.")
    .positive("Please select a temple."),

  deity_name: z
    .string()
    .trim()
    .min(2, "Deity name must be at least 2 characters.")
    .max(150, "Deity name must be at most 150 characters."),



  deity_img_name: z
    .string()
    .trim()
    .max(50, "Image filename must be at most 50 characters."),

  deity_description: z
    .string()
    .max(5000, "Description must be at most 5000 characters."),

  deity_is_default: z.enum(["yes", "no"], {
    error: "Please select whether this is the default deity.",
  }),

  deity_display_order: z
    .number()
    .int("Display order must be a whole number.")
    .min(0, "Display order cannot be negative.")
    .max(65535, "Display order cannot exceed 65535."),

  deity_status: z.enum(["active", "inactive"], {
    error: "Please select a status.",
  }),
});

export type DeityFormData = z.infer<typeof deitySchema>;