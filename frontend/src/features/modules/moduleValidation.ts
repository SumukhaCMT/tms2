


import * as z from "zod"

export const moduleSchema = z
  .object({
    module_code: z
      .string()
      .trim()
      .min(3, "Module code must be at least 3 characters.")
      .max(50, "Module code must be at most 50 characters.")
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "Module code can contain only letters, numbers, _ and -."
      ),

    // module_name: z
    //   .string()
    //   .trim()
    //   .min(3, "Module name must be at least 3 characters.")
    //   .max(100, "Module name must be at most 100 characters.")
    //   .regex(
    //     /^[A-Za-z0-9_-]+$/,
    //     "Module Not contain   numbers, _ and -. only letters"
    //   ),
module_name: z
  .string()
  .trim()
  .min(3, "Module name must be at least 3 characters.")
  .max(100, "Module name must be at most 100 characters.")
  .regex(
    /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/,
    "Module name can contain only letters and spaces."
  ),
    module_type: z.enum(
      ["feature", "capacity", "consumable"] as const,
      {
        error: "Please select a module type.",
      }
    ),

    // IMPORTANT:
    // Required property, but value can be null.
    capacity_type: z
      .enum(["users", "temple"] as const)
      .nullable(),

    // IMPORTANT:
    // Required property, but value can be null.
    consumable_type: z
      .enum(["sms", "email", "whatsapp"] as const)
      .nullable(),

    display_order: z
      .number()
      .int("Display order must be a whole number.")
      .min(0, "Display order cannot be negative."),

    status: z.enum(
      ["active", "inactive"] as const,
      {
        error: "Please select a status.",
      }
    ),
  })
  .superRefine((data, ctx) => {
    if (
      data.module_type === "capacity" &&
      !data.capacity_type
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["capacity_type"],
        message: "Please select a capacity type.",
      })
    }

    if (
      data.module_type === "consumable" &&
      !data.consumable_type
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["consumable_type"],
        message: "Please select a consumable type.",
      })
    }
  })

export type ModuleFormData = z.infer<typeof moduleSchema>