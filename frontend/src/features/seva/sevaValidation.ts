
import { z } from "zod";

export const sevaSchema = z.object({
  temple_id: z.number().int().positive("Please select a temple."),
  seva_name: z
    .string()
    .trim()
    .min(2, "Seva name must contain at least 2 characters.")
    .max(150, "Seva name cannot exceed 150 characters."),
  seva_amount: z.number().min(0, "Amount cannot be negative."),
  seva_gst_percent: z
    .number()
    .min(0, "GST cannot be negative.")
    .max(100, "GST cannot exceed 100%."),
  seva_is_default: z.enum(["yes", "no"]),
  seva_display_order: z
    .number()
    .int()
    .min(0, "Display order cannot be negative.")
    .max(65535, "Display order is too large."),
  seva_remark: z
    .string()
    .max(255, "Remark cannot exceed 5000 characters."),
  seva_status: z.enum(["active", "inactive"]),
    // Optional deity selection
     // Deity is optional
  deity_id: z.number().int().positive().nullable().optional(),
 
  deity_name: z.string().optional(),
  deity_code: z.string().optional(),
});

export type SevaFormValues = z.infer<typeof sevaSchema>;
