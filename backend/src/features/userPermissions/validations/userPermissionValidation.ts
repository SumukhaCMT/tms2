import { z } from "zod"

export const userPermissionsSchema = z.object({
  permissions: z
    .array(
      z.object({
        sub_module_id: z.coerce.number().int().positive(),
        permission: z.coerce.number().int().min(0).max(7),
      }),
    )
    .max(500),
})
