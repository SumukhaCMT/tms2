
import { z } from "zod";

/**
 * Validate a real YYYY-MM-DD calendar date.
 */
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);

    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }, "Please enter a valid date");

/**
 * Shared trustee fields.
 *
 * Keep this schema free of object-level refinements so that
 * .partial() can safely be used for update validation.
 */
const trusteeBaseSchema = z.object({
  temple_id: z.coerce.number().int().positive().nullable().optional(),

  trustee_name: z
    .string()
    .trim()
    .min(2, "Trustee name must be at least 2 characters")
    .max(150, "Trustee name cannot exceed 150 characters")
    .regex(
      /^[\p{L}\p{M} .'-]+$/u,
      "Trustee name must not contain numbers or special characters",
    ),

  trustee_email: z
    .union([
      z.string().trim().email("Enter a valid email address").max(150),
      z.literal(""),
      z.null(),
    ])
    .optional(),

  trustee_phone: z
    .union([
      z.string().trim().regex(/^\d{10}$/, "Phone number must contain exactly 10 digits"),
      z.literal(""),
      z.null(),
    ])
    .optional(),

  trustee_position: z
    .string()
    .trim()
    .max(100, "Position cannot exceed 100 characters")
    .nullable()
    .optional(),

  trustee_display_order: z.coerce
    .number()
    .int("Display order must be an integer")
    .min(0, "Display order cannot be negative")
    .optional(),

  trustee_address_line1: z.string().trim().max(255).nullable().optional(),
  trustee_address_line2: z.string().trim().max(255).nullable().optional(),
  trustee_city: z.string().trim().max(100).nullable().optional(),
  trustee_state: z.string().trim().max(100).nullable().optional(),

  trustee_country: z
    .string()
    .trim()
    .min(1, "Country cannot be empty")
    .max(100)
    .optional(),

  trustee_pincode: z
    .union([
      z.string().trim().regex(/^\d{6}$/, "PIN code must contain exactly 6 digits"),
      z.literal(""),
      z.null(),
    ])
    .optional(),

  trustee_status: z.enum(["active", "inactive", "former"]).optional(),

  start_date: dateSchema.nullable().optional(),
  end_date: dateSchema.nullable().optional(),
});

/**
 * Validate a date range when both dates are available.
 */
function validateDateRange(
  data: {
    start_date?: string | null;
    end_date?: string | null;
  },
  ctx: z.RefinementCtx,
): void {
  if (
    data.start_date &&
    data.end_date &&
    data.end_date <= data.start_date
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["end_date"],
      message: "End date must be later than start date",
    });
  }
}

/**
 * CREATE TRUSTEE
 *
 * Both dates are required when creating a trustee.
 */
export const createTrusteeSchema = trusteeBaseSchema
  .extend({
    trustee_name: trusteeBaseSchema.shape.trustee_name,
    trustee_country: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .default("India"),
    trustee_display_order: z.coerce
      .number()
      .int()
      .min(0)
      .default(1),
    trustee_status: z
      .enum(["active", "inactive", "former"])
      .default("active"),
    start_date: dateSchema,
    end_date: dateSchema,
  })
  .superRefine(validateDateRange);

/**
 * UPDATE TRUSTEE
 *
 * Partial is applied before adding date-range validation.
 */
export const updateTrusteeSchema = trusteeBaseSchema
  .partial()
  .superRefine(validateDateRange);

/**
 * GET TRUSTEES LIST QUERY
 *
 * This export is required by trusteeController.ts.
 */
export const trusteeListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().trim().max(150).optional(),

  status: z.enum(["active", "inactive", "former"]).optional(),

  temple_id: z.coerce.number().int().positive().optional(),
});

/**
 * Trustee ID validation.
 */
export const trusteeIdSchema = z.coerce
  .number()
  .int()
  .positive();

/**
 * Inferred TypeScript input types.
 */
export type CreateTrusteeInput = z.infer<typeof createTrusteeSchema>;

export type UpdateTrusteeInput = z.infer<typeof updateTrusteeSchema>;

export type TrusteeListQueryInput = z.infer<typeof trusteeListQuerySchema>;
