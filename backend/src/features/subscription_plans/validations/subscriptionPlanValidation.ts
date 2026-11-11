


import { z } from "zod"

/*
 * ================================================================
 * BASE SUBSCRIPTION PLAN SCHEMA
 * ================================================================
 */

const subscriptionPlanBaseSchema = z.object({
  module_id: z
    .number()
    .int("Module ID must be a whole number.")
    .positive("Please select a valid module."),

  plan_name: z
    .string()
    .trim()
    .min(2, "Plan name is required")
    .max(100),

  plan_code: z
    .string()
    .trim()
    .min(2, "Plan code is required")
    .max(50)
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Plan code can contain only letters, numbers, hyphens and underscores.",
    ),

  plan_type: z.enum([
    "subscription",
    "perpetual",
  ]),

  plan_quantity: z
    .number()
    .int("Quantity must be a whole number.")
    .min(0)
    .nullable(),

  plan_duration_months: z
    .number()
    .int("Duration must be a whole number.")
    .positive("Duration must be greater than 0.")
    .nullable(),

  plan_price: z
    .number()
    .min(0, "Plan price cannot be negative."),

  plan_gst_percentage: z
    .number()
    .min(0, "GST cannot be negative.")
    .max(100, "GST cannot exceed 100%."),

  plan_total_price: z
    .number()
    .min(0, "Total price cannot be negative.")
    .optional(),

  plan_amc_price: z
    .number()
    .min(0, "AMC price cannot be negative.")
    .nullable(),

  plan_amc_duration_months: z
    .number()
    .int("AMC duration must be a whole number.")
    .min(0, "AMC duration cannot be negative.")
    .nullable(),

  plan_amc_gst_percentage: z
    .number()
    .min(0, "AMC GST cannot be negative.")
    .max(100, "AMC GST cannot exceed 100%."),

  plan_amc_start_date: z
    .string()
    .nullable(),

  plan_status: z.enum([
    "active",
    "inactive",
  ]),
})

/*
 * ================================================================
 * CREATE SUBSCRIPTION PLAN
 * ================================================================
 */

export const createSubscriptionPlanSchema =
  subscriptionPlanBaseSchema.superRefine(
    (data, ctx) => {
      /*
       * Subscription
       */
      if (data.plan_type === "subscription") {
        if (
          data.plan_duration_months === null ||
          data.plan_duration_months === undefined ||
          data.plan_duration_months <= 0
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["plan_duration_months"],
            message:
              "Duration is required for subscription plans.",
          })
        }
      }

      /*
       * Perpetual
       */
      if (data.plan_type === "perpetual") {
        if (
          !data.plan_amc_start_date ||
          data.plan_amc_start_date.trim() === ""
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["plan_amc_start_date"],
            message:
              "AMC start date is required for perpetual plans.",
          })
        }
      }
    },
  )

/*
 * ================================================================
 * UPDATE SUBSCRIPTION PLAN
 *
 * IMPORTANT:
 * Use partial() on the BASE object, not the refined schema.
 * ================================================================
 */

export const updateSubscriptionPlanSchema =
  subscriptionPlanBaseSchema.partial()

/*
 * ================================================================
 * SUBSCRIPTION PLAN ID
 * ================================================================
 */

export const subscriptionPlanIdSchema = z.object({
  id: z.coerce.number().int().positive(),
})