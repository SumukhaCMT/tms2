import {
  z,
} from "zod"


/* =========================================================
   PERMISSION VALIDATION
========================================================= */

export const rolePermissionSchema =
  z.object({

    sub_module_id:
      z.number()
        .int()
        .positive(),

    permission:
      z.number()
        .int()
        .min(0)
        .max(7),

  })


/* =========================================================
   ROLE VALIDATION
========================================================= */

export const roleSchema =
  z.object({

    user_role_name:
      z.string()
        .trim()
        .min(
          2,
          "Role namesss is required",
        )
        .max(
          50,
          "Role name must not exceed 50 characters",
        ),

    permissions:
      z.array(
        rolePermissionSchema,
      ),

  })


/* =========================================================
   TYPE
========================================================= */

export type RoleValidationData =
  z.infer<typeof roleSchema>