
import * as z from "zod"

export const paymentMethodSchema = z.object({
  temple_id: z
    .number()
    .int("Temple ID must be a whole number.")
    .positive("Please Select a valid temple."),

  payment_method: z
    .string()
    .trim()
    .min(3, "Payment method must be at least 3 characters.")
    .max(100, "Payment method must be at most 100 characters."),

  payment_method_type: z.enum(["online", "offline"], {
    error: "Please select a payment method type.",
  }),

  remark: z
    .string()
    .max(500, "Remark must be at most 500 characters."),

  is_default: z.enum(["yes", "no"], {
    error: "Please select whether this is the default method.",
  }),

  display_order: z
    .number()
    .int("Display order must be a whole number.")
    .min(0, "Display order cannot be negative."),

  status: z.enum(["active", "inactive"], {
    error: "Please select a status.",
  }),
})

export type PaymentMethodFormData = z.infer<
  typeof paymentMethodSchema
>