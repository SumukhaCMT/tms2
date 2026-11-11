
import { z } from "zod";

const positiveIdSchema = z.number().int().positive();

const nullableIdSchema = positiveIdSchema.nullable().optional();

const tokenStatusSchema = z.enum(["active", "inactive"]);

export const createTokenSchema = z.object({
  temple_id: positiveIdSchema.optional(),
max_limit: z
  .number()
  .int("Maximum tokens must be a whole number")
  .min(1, "Maximum tokens must be at least 1")
  .max(65535, "Maximum tokens cannot exceed 65535")
  .nullable()
  .optional(),
  token_name: z
    .string()
    .trim()
    .min(2, "Token name must contain at least 2 characters")
    .max(100, "Token name must not exceed 100 characters"),

  token_description: z
    .string()
    .trim()
    .max(500, "Token description must not exceed 500 characters")
    .nullable()
    .optional(),

  seva_id: nullableIdSchema,
  deity_id: nullableIdSchema,

  token_display_order: z
    .number()
    .int()
    .min(0, "Display order cannot be negative")
    .optional(),

  token_status: tokenStatusSchema.optional(),
});

export const updateTokenSchema = z
  .object({
    temple_id: positiveIdSchema.optional(),

    token_name: z
      .string()
      .trim()
      .min(2, "Token name must contain at least 2 characters")
      .max(100, "Token name must not exceed 100 characters")
      .optional(),

    token_description: z
      .string()
      .trim()
      .max(500, "Token description must not exceed 500 characters")
      .nullable()
      .optional(),

    seva_id: nullableIdSchema,
    deity_id: nullableIdSchema,

    token_display_order: z
      .number()
      .int()
      .min(0, "Display order cannot be negative")
      .optional(),

    token_status: tokenStatusSchema.optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    { message: "At least one field must be provided for update" },
  );

export const tokenListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().trim().max(100).optional(),

  temple_id: z.coerce.number().int().positive().optional(),

  token_status: tokenStatusSchema.optional(),
});

export type CreateTokenInput = z.infer<typeof createTokenSchema>;
export type UpdateTokenInput = z.infer<typeof updateTokenSchema>;
export type TokenListQueryInput = z.infer<typeof tokenListQuerySchema>;
