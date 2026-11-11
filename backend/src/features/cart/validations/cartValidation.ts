import { z } from "zod"

const id = z.number().int().positive()
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")

export const addCartItemSchema = z
  .object({
    plan_id: id.optional(),
    bundle_id: id.optional(),
    replace_ids: z.array(id).default([]),
  })
  .refine((data) => !data.plan_id !== !data.bundle_id, "Provide either a plan or a bundle")

export const checkoutSchema = z.object({
  payment_mode: z.enum(["cash", "cheque", "bank_transfer", "upi", "gpay", "netbanking", "demand_draft", "other"]),
  transaction_number: z.string().trim().min(1, "Transaction number is required").max(150),
  payment_date: date,
  remarks: z.string().trim().max(255).default(""),
})
