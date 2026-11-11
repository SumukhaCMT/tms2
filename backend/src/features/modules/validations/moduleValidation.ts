import { z } from "zod"

export const moduleSchema = z
  .object({
    module_name: z
      .string()
      .trim()
      .min(3, "Module name must be at least 3 characters")
      .max(100, "Module name cannot exceed 100 characters"),
    module_type: z.enum(["feature", "capacity", "consumable"]),
    capacity_type: z.enum(["users", "temples"]).nullable().optional(),
    consumable_type: z.enum(["sms", "email", "whatsapp"]).nullable().optional(),
    display_order: z.number().int().min(0, "Display order cannot be negative").optional(),
    status: z.enum(["active", "inactive"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.module_type === "capacity" && !data.capacity_type) {
      ctx.addIssue({ code: "custom", path: ["capacity_type"], message: "Capacity type is required for capacity modules" })
    }
    if (data.module_type === "consumable" && !data.consumable_type) {
      ctx.addIssue({ code: "custom", path: ["consumable_type"], message: "Consumable type is required for consumable modules" })
    }
  })
