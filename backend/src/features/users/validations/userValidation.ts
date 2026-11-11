import { z } from "zod"

export const createUserSchema = z.object({
  temple_id: z.coerce.number().int().positive("Select a temple"),
  user_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  user_email: z.string().trim().toLowerCase().email("Enter a valid email"),
  user_phone: z.string().trim().regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
  role_id: z.coerce.number().int().positive("Select a valid role"),
  designation_name: z.string().trim().min(2, "Role name must be at least 2 characters").max(100),
  user_status: z.string().trim().min(1, "Select a status"),
})

export const updateUserStatusSchema = z.object({
  user_status: z.string().trim().min(1, "Select a status"),
})

export const updateUserSchema = createUserSchema.omit({ temple_id: true })

export const transferTempleSchema = z.object({
  to_temple_id: z.coerce.number().int().positive("Select a new temple"),
  transfer_reason: z.string().trim().min(3, "Transfer reason must be at least 3 characters").max(500),
})
