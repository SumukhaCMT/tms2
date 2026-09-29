import { z } from "zod";

export const subscriptionBundleSchema = z
  .object({
    bundle_name: z
      .string()
      .trim()
      .min(1, "Bundle name is required")
      .max(150, "Bundle name cannot exceed 150 characters"),

    bundle_code: z
      .string()
      .trim()
      .min(1, "Bundle code is required")
      .max(50, "Bundle code cannot exceed 50 characters"),

    bundle_type: z.enum(["subscription", "perpetual"]),

    bundle_duration_months: z
      .number()
      .nonnegative("Duration cannot be negative")
      .nullable()
      .optional(),

    bundle_price: z
      .number()
      .nonnegative("Bundle price cannot be negative"),

    bundle_gst_percentage: z
      .number()
      .min(0, "GST cannot be negative")
      .max(100, "GST cannot exceed 100")
      .default(0),

    bundle_total_price: z
      .number()
      .nonnegative("Total price cannot be negative"),

    bundle_amc_price: z
      .number()
      .nonnegative("AMC price cannot be negative")
      .nullable()
      .optional(),

    bundle_amc_duration_months: z
      .number()
      .nonnegative("AMC duration cannot be negative")
      .nullable()
      .optional(),

    bundle_amc_gst_percentage: z
      .number()
      .min(0)
      .max(100)
      .nullable()
      .optional(),

    bundle_status: z
      .enum(["active", "inactive"])
      .default("active"),

    plan_ids: z
      .array(z.number().int().positive())
      .min(1, "At least one plan must be selected"),
  })
  .superRefine((data, ctx) => {
    if (
      data.bundle_type === "subscription" &&
      (data.bundle_duration_months === null ||
        data.bundle_duration_months === undefined)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["bundle_duration_months"],
        message: "Duration is required for subscription bundles",
      });
    }

    if (data.bundle_type === "perpetual") {
      if (
        data.bundle_amc_price === undefined ||
        data.bundle_amc_price === null
      ) {
        // AMC is optional according to your requirement,
        // so no validation error here.
      }
    }
  });

export const updateSubscriptionBundleSchema =
  subscriptionBundleSchema.partial();