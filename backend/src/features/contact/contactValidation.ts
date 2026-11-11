import { z } from "zod"

export const createContactSchema = z
  .object({
    sub_module_id: z.coerce.number().int().positive().nullable().optional(),
    other: z.string().trim().max(150).nullable().optional(),
    subject: z.string().trim().min(1, "Subject is required").max(200),
    message: z.string().trim().min(1, "Message is required").max(5000),
  })
  .refine((data) => !(data.sub_module_id && data.other), {
    message: "Choose a module or enter other, not both",
    path: ["other"],
  })

export type CreateContactInput = z.infer<typeof createContactSchema>

export const contactStatusSchema = z.object({
  status: z.literal("resolved"),
})

export const contactListQuerySchema = z.object({
  status: z.enum(["pending", "resolved"]).optional(),
})
