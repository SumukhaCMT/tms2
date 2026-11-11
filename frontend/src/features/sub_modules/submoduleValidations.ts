

import * as z from "zod"

/* ==========================================================================
   SUB MODULE PERMISSION
========================================================================== */

export const subModulePermissionSchema = z.object({
  role_id: z
    .number()
    .int("Role ID must be a whole number.")
    .positive("Role ID must be greater than 0."),

  permission: z
    .number()
    .int("Permission must be a whole number.")
    .min(
      0,
      "Permission cannot be less than 0.",
    )
    .max(
      7,
      "Permission cannot be greater than 7.",
    ),
})

/* ==========================================================================
   SUB MODULE
========================================================================== */

export const subModuleSchema = z
  .object({
    /* ----------------------------------------------------------------------
       PARENT MODULE
    ---------------------------------------------------------------------- */

    module_id: z
      .number()
      .int("Module ID must be a whole number.")
      .positive(
        "Please select a parent module.",
      ),

   
    /* ----------------------------------------------------------------------
       SUB MODULE NAME
    ---------------------------------------------------------------------- */

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

    /* ----------------------------------------------------------------------
       STATUS
    ---------------------------------------------------------------------- */

    sub_module_status: z.enum(
      [
        "active",
        "inactive",
      ] as const,
      {
        error:
          "Please select a sub module status.",
      },
    ),

    /* ----------------------------------------------------------------------
       DISPLAY ORDER
    ---------------------------------------------------------------------- */

    display_order: z
      .number()
      .int(
        "Display order must be a whole number.",
      )
      .min(
        0,
        "Display order cannot be negative.",
      ),

    /* ----------------------------------------------------------------------
       NOTE
    ---------------------------------------------------------------------- */

    note: z
      .string()
      .trim()
      .max(
        500,
        "Note must be at most 500 characters.",
      ),

    /* ----------------------------------------------------------------------
       PERMISSIONS

       IMPORTANT:
       Do NOT use .length(4).

       The number of roles comes from the database.
       ---------------------------------------------------------------------- */

    permissions: z
      .array(
        subModulePermissionSchema,
      )
      .min(
        1,
        "Permissions must be configured for all roles.",
      ),
  })

  /* ------------------------------------------------------------------------
     EXTRA PERMISSION VALIDATION
  ------------------------------------------------------------------------ */

  .superRefine(
    (data, ctx) => {
      const roleIds =
        data.permissions.map(
          (permission) =>
            permission.role_id,
        )

      const uniqueRoleIds =
        new Set(roleIds)

      /* Prevent duplicate role permission records */

      if (
        uniqueRoleIds.size !==
        roleIds.length
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["permissions"],
          message:
            "Duplicate role permissions are not allowed.",
        })
      }
    },
  )

/* ==========================================================================
   TYPE
========================================================================== */

export type SubModuleFormData =
  z.infer<typeof subModuleSchema>