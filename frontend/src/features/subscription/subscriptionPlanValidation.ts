
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


// import { z } from "zod"

// export const subscriptionPlanSchema = z
//   .object({
//     module_id: z
//       .number({
//         message: "Module is required",
//       })
//       .int("Module is required")
//       .positive("Module is required"),

//     plan_name: z
//       .string()
//       .trim()
//       .min(1, "Plan name is required"),

//     plan_code: z
//       .string()
//       .trim()
//       .min(1, "Plan code is required"),

//     plan_type: z.enum(["subscription", "perpetual"], {
//       message: "Plan type is required",
//     }),

//     plan_quantity: z
//       .number()
//       .int("Quantity must be a whole number")
//       .nonnegative("Quantity cannot be negative")
//       .nullable()
//       .optional(),

//     plan_duration_months: z
//       .number()
//       .positive("Duration must be greater than 0")
//       .nullable()
//       .optional(),

//     plan_price: z
//       .number()
//       .nonnegative("Plan price cannot be negative"),

//     plan_gst_percentage: z
//       .number()
//       .min(0, "GST cannot be negative")
//       .max(100, "GST cannot be more than 100"),

//     plan_total_price: z
//       .number()
//       .nonnegative("Total price cannot be negative"),

//     plan_amc_price: z
//       .number()
//       .nonnegative("AMC price cannot be negative")
//       .nullable()
//       .optional(),

//     plan_amc_duration_months: z
//       .number()
//       .positive("AMC duration must be greater than 0")
//       .nullable()
//       .optional(),

//     plan_amc_gst_percentage: z
//       .number()
//       .min(0, "AMC GST cannot be negative")
//       .max(100, "AMC GST cannot be more than 100"),

//     plan_amc_start_date: z
//       .string()
//       .nullable()
//       .optional(),

//     plan_status: z.enum(["active", "inactive"], {
//       message: "Status is required",
//     }),
//   })
//   .superRefine((data, ctx) => {
//     if (
//       data.plan_type === "subscription" &&
//       (!data.plan_duration_months ||
//         data.plan_duration_months <= 0)
//     ) {
//       ctx.addIssue({
//         code: "custom",
//         path: ["plan_duration_months"],
//         message: "Duration is required for subscription plans",
//       })
//     }

//     if (data.plan_type === "perpetual") {
//       if (
//         data.plan_amc_price === null ||
//         data.plan_amc_price === undefined
//       ) {
//         ctx.addIssue({
//           code: "custom",
//           path: ["plan_amc_price"],
//           message: "AMC price is required",
//         })
//       }

//       if (
//         data.plan_amc_duration_months === null ||
//         data.plan_amc_duration_months === undefined ||
//         data.plan_amc_duration_months <= 0
//       ) {
//         ctx.addIssue({
//           code: "custom",
//           path: ["plan_amc_duration_months"],
//           message: "AMC duration is required",
//         })
//       }

//       if (!data.plan_amc_start_date) {
//         ctx.addIssue({
//           code: "custom",
//           path: ["plan_amc_start_date"],
//           message: "AMC start date is required",
//         })
//       }
//     }
//   })

// export type SubscriptionPlanFormData = z.infer<
//   typeof subscriptionPlanSchema
// >
