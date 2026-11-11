



import { z } from "zod";

const positiveId = z.coerce.number().int().positive();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format");

export const createIssuedTokenSchema = z.object({
  token_id: positiveId,
  temple_id: positiveId.optional(),
  token_quantity: z.coerce.number().int().min(1).max(999),
  token_payment_method: z.enum(["Cash", "UPI", "Card", "Bank Transfer", "Other"]),
  token_performed_date: dateSchema,
  token_remark: z.string().trim().max(500).nullable().optional(),
  // devotee_name: z.string().trim().min(1).max(150).nullable().optional(),
  // devotee_mobile: z.string().trim().regex(/^[0-9]{10}$/, "Mobile number must contain 10 digits").nullable().optional(),
});

export const issuedTokenListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  temple_id: positiveId.optional(),
  token_status: z.enum(["pending", "completed", "cancelled", "refunded"]).optional(),
  from_date: dateSchema.optional(),
  to_date: dateSchema.optional(),
});

export type CreateIssuedTokenValidationInput = z.infer<typeof createIssuedTokenSchema>;
export type IssuedTokenListQueryInput = z.infer<typeof issuedTokenListQuerySchema>;
