


import * as z from "zod"

export const subModulePermissionSchema = z.object({
  role_id: z
    .number()
    .int("Role ID must be a whole number.")
    .positive("Role ID must be greater than 0."),

  permission: z
    .number()
    .int("Permission must be a whole number.")
    .min(0, "Permission cannot be less than 0.")
    .max(7, "Permission cannot be greater than 7."),
})

export const subModuleSchema = z.object({
  module_id: z
    .number()
    .int("Module ID must be a whole number.")
    .positive("Please select a parent module."),

  sub_module_code: z
    .string()
    .trim()
    .min(
      3,
      "Sub module code must be at least 3 characters.",
    )
    .max(
      50,
      "Sub module code must be at most 50 characters.",
    )
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Sub module code can contain only letters, numbers, _ and -.",
    ),

  sub_module_name: z
    .string()
    .trim()
    .min(
      3,
      "Sub module name must be at least 3 characters.",
    )
    .max(
      100,
      "Sub module name must be at most 100 characters.",
    )
    .regex(
      /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/,
      "Sub module name can contain only letters and spaces.",
    ),

  sub_module_status: z.enum(
    ["active", "inactive"] as const,
    {
      error: "Please select a sub module status.",
    },
  ),

  display_order: z
    .number()
    .int("Display order must be a whole number.")
    .min(
      0,
      "Display order cannot be negative.",
    ),

  note: z
    .string()
    .trim()
    .max(
      500,
      "Note must be at most 500 characters.",
    ),

  permissions: z
    .array(subModulePermissionSchema)
    .length(
      4,
      "Permissions must be configured for all roles.",
    ),
})

export type SubModuleFormData =
  z.infer<typeof subModuleSchema>