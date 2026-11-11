
import * as z from "zod"

export const subscriptionPlanSchema = z.object({
  module_id: z
    .number()
    .int("Module ID must be a whole number.")
    .positive("Please select a valid module."),

  plan_name: z
    .string()
    .trim()
    .min(
      3,
      "Plan name must be at least 3 characters.",
    )
    .max(
      150,
      "Plan name cannot exceed 150 characters.",
    ).regex(
    /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/,
    "Plan name can contain only letters and spaces."
  ),

  plan_code: z
    .string()
    .trim()
    .min(
      3,
      "Plan code must be at least 3 characters.",
    )
    .max(
      50,
      "Plan code cannot exceed 50 characters.",
    )
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Plan code can contain only letters, numbers, hyphens and underscores.",
    ),

  plan_type: z.enum(
    ["subscription", "perpetual"] as const,
    {
      error: "Please select a plan type.",
    },
  ),

  plan_quantity: z
    .number()
    .int("Quantity must be a whole number.")
    .min(
      0,
      "Quantity cannot be negative.",
    )
    .nullable(),

  plan_duration_months: z
    .number()
    .positive(
      "Duration must be greater than 0.",
    )
    .nullable(),

  plan_price: z
    .number()
    .min(
      0,
      "Plan price cannot be negative.",
    ),

  plan_gst_percentage: z
    .number()
    .min(
      0,
      "GST cannot be negative.",
    )
    .max(
      100,
      "GST cannot exceed 100%.",
    ),

  plan_total_price: z
    .number()
    .min(
      0,
      "Total price cannot be negative.",
    ),

  plan_amc_price: z
    .number()
    .min(
      0,
      "AMC price cannot be negative.",
    )
    .nullable(),

  plan_amc_duration_months: z
    .number()
    .positive(
      "AMC duration must be greater than 0.",
    )
    .nullable(),

  plan_amc_gst_percentage: z
    .number()
    .min(
      0,
      "AMC GST cannot be negative.",
    )
    .max(
      100,
      "AMC GST cannot exceed 100%.",
    ),

  plan_amc_start_date: z
    .string()
    .nullable(),

  plan_status: z.enum(
    ["active", "inactive"] as const,
    {
      error: "Please select a plan status.",
    },
  ),
})

export type SubscriptionPlanFormData =
  z.infer<typeof subscriptionPlanSchema>

