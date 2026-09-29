import { z } from "zod"

const permissionSchema = z.object({
  role_id: z.number().int().positive(),

  permission: z
    .number()
    .int()
    .min(0)
    .max(7)
    .nullable(),
})

export const createSubModuleSchema = z.object({
  module_id: z
    .number()
    .int()
    .positive(),

  sub_module_code: z
    .string()
    .trim()
    .min(1, "Sub module code is required")
    .max(100, "Sub module code cannot exceed 100 characters"),

  sub_module_name: z
    .string()
    .trim()
    .min(1, "Sub module name is required")
    .max(150, "Sub module name cannot exceed 150 characters"),

  sub_module_status: z.enum([
    "active",
    "inactive",
  ]),

  display_order: z
    .number()
    .int()
    .min(0, "Display order must be at least 1"),

  note: z
    .string()
    .trim()
    .max(500, "Note cannot exceed 500 characters")
    .nullable()
    .optional(),

  permissions: z
    .array(permissionSchema)
    .min(1, "At least one permission is required"),
})

export const updateSubModuleSchema =
  createSubModuleSchema