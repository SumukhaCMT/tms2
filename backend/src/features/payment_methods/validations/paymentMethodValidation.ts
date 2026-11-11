
import { z } from "zod";

export const createPaymentMethodSchema = z.object({
  temple_id: z
    .number({
      error: "Temple ID is required",
    })
    .int()
    .positive(),

  payment_method: z
    .string()
    .trim()
    .min(1, "Payment method is required")
    .max(
      100,
      "Payment method must not exceed 100 characters"
    ),

  payment_method_type: z.enum([
    "online",
    "offline",
  ]),

  remark: z
    .string()
    .trim()
    .nullable()
    .optional(),

  is_default: z
    .enum(["yes", "no"])
    .optional()
    .default("no"),

  display_order: z
    .number()
    .int()
    .min(0)
    .optional()
    .default(0),

  status: z
    .enum(["active", "inactive"])
    .optional()
    .default("active"),
});

export const updatePaymentMethodSchema = z.object({
  temple_id: z
    .number()
    .int()
    .positive()
    .optional(),

  payment_method: z
    .string()
    .trim()
    .min(1, "Payment method is required")
    .max(
      100,
      "Payment method must not exceed 100 characters"
    )
    .optional(),

  payment_method_type: z
    .enum([
      "online",
      "offline",
    ])
    .optional(),

  remark: z
    .string()
    .trim()
    .nullable()
    .optional(),

  is_default: z
    .enum(["yes", "no"])
    .optional(),

  display_order: z
    .number()
    .int()
    .min(0)
    .optional(),

  status: z
    .enum([
      "active",
      "inactive",
    ])
    .optional(),
});