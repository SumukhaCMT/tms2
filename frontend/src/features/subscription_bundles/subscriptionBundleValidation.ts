


import { z } from "zod"

export const subscriptionBundleSchema = z
  .object({
    bundle_name: z
      .string()
      .trim()
      .min(
        2,
        "Bundle name must be at least 2 characters",
      )
      .max(
        150,
        "Bundle name cannot exceed 150 characters",
      ),

    bundle_code: z
      .string()
      .trim()
      .min(
        2,
        "Bundle code is required",
      )
      .max(
        100,
        "Bundle code cannot exceed 100 characters",
      )
      .regex(
        /^[A-Z0-9_-]+$/,
        "Use uppercase letters, numbers, '_' or '-'.",
      ),

    bundle_type: z.enum([
      "subscription",
      "perpetual",
    ]),

    // bundle_duration_months: z
    //   .union([
    //     z.coerce
    //       .number()
    //       .int(
    //         "Duration must be a whole number",
    //       )
    //       .positive(
    //         "Duration must be greater than 0",
    //       ),
    //     z.null(),
    //   ]),

    bundle_duration_months: z
  .union([
    z.coerce
      .number()
      .int("Duration must be a whole number")
      .positive(
        "Duration must be greater than 0",
      ),
    z.null(),
  ]),
    bundle_price: z.coerce
      .number()
      .finite(
        "Bundle price must be a valid number",
      )
      .min(
        0,
        "Bundle price cannot be negative",
      ),

    bundle_gst_percentage: z.coerce
      .number()
      .finite(
        "GST must be a valid number",
      )
      .min(
        0,
        "GST cannot be negative",
      )
      .max(
        100,
        "GST cannot exceed 100%",
      ),

    bundle_total_price: z.coerce
      .number()
      .finite(
        "Total price must be a valid number",
      )
      .min(
        0,
        "Total price cannot be negative",
      ),

    bundle_amc_price: z
      .union([
        z.coerce
          .number()
          .finite(
            "AMC price must be a valid number",
          )
          .min(
            0,
            "AMC price cannot be negative",
          ),
        z.null(),
      ]),

    bundle_amc_duration_months: z
      .union([
        z.coerce
          .number()
          .int(
            "AMC duration must be a whole number",
          )
          .positive(
            "AMC duration must be greater than 0",
          ),
        z.null(),
      ]),

    bundle_amc_gst_percentage: z
      .union([
        z.coerce
          .number()
          .finite(
            "AMC GST must be a valid number",
          )
          .min(
            0,
            "AMC GST cannot be negative",
          )
          .max(
            100,
            "AMC GST cannot exceed 100%",
          ),
        z.null(),
      ]),

    bundle_status: z.enum([
      "active",
      "inactive",
    ]),

    plan_ids: z
      .array(
        z.coerce.number().int(),
      )
      .min(
        1,
        "Select at least one subscription plan",
      ),
  })
  .superRefine((data, ctx) => {
    /*
     * -------------------------------------------------------
     * SUBSCRIPTION BUNDLE
     * -------------------------------------------------------
     */

    if (
      data.bundle_type === "subscription"
    ) {
      if (
        data.bundle_duration_months === null
      ) {
        ctx.addIssue({
          code: "custom",
          path: [
            "bundle_duration_months",
          ],
          message:
            "Duration is required for subscription bundle",
        })
      }

      /*
       * Subscription bundles do not use AMC.
       */
      if (
        data.bundle_amc_price !== null
      ) {
        ctx.addIssue({
          code: "custom",
          path: [
            "bundle_amc_price",
          ],
          message:
            "AMC price is not applicable for subscription bundle",
        })
      }

      if (
        data.bundle_amc_duration_months !==
        null
      ) {
        ctx.addIssue({
          code: "custom",
          path: [
            "bundle_amc_duration_months",
          ],
          message:
            "AMC duration is not applicable for subscription bundle",
        })
      }
    }

    /*
     * -------------------------------------------------------
     * PERPETUAL BUNDLE
     * -------------------------------------------------------
     */

    if (
      data.bundle_type === "perpetual"
    ) {
      /*
       * Perpetual bundles do not use
       * subscription duration.
       */
      if (
        data.bundle_duration_months !== null
      ) {
        ctx.addIssue({
          code: "custom",
          path: [
            "bundle_duration_months",
          ],
          message:
            "Duration is not applicable for perpetual bundle",
        })
      }

      /*
       * AMC price required.
       */
      if (
        data.bundle_amc_price === null
      ) {
        ctx.addIssue({
          code: "custom",
          path: [
            "bundle_amc_price",
          ],
          message:
            "AMC price is required for perpetual bundle",
        })
      }

      /*
       * AMC duration required.
       */
      if (
        data.bundle_amc_duration_months ===
        null
      ) {
        ctx.addIssue({
          code: "custom",
          path: [
            "bundle_amc_duration_months",
          ],
          message:
            "AMC duration is required for perpetual bundle",
        })
      }

      /*
       * AMC GST required.
       */
      if (
        data.bundle_amc_gst_percentage ===
        null
      ) {
        ctx.addIssue({
          code: "custom",
          path: [
            "bundle_amc_gst_percentage",
          ],
          message:
            "AMC GST is required for perpetual bundle",
        })
      }
    }

    /*
     * -------------------------------------------------------
     * TOTAL PRICE CHECK
     * -------------------------------------------------------
     *
     * Total = Bundle Price + GST
     *
     * Example:
     * Price = 5000
     * GST   = 18%
     * GST   = 900
     * Total = 5900
     */

    const expectedTotal =
      data.bundle_price +
      (data.bundle_price *
        data.bundle_gst_percentage) /
        100

    const roundedExpectedTotal =
      Number(expectedTotal.toFixed(2))

    const roundedActualTotal =
      Number(
        data.bundle_total_price.toFixed(2),
      )

    if (
      roundedActualTotal !==
      roundedExpectedTotal
    ) {
      ctx.addIssue({
        code: "custom",
        path: [
          "bundle_total_price",
        ],
        message:
          "Total price must equal Bundle Price + GST",
      })
    }
  })

export type SubscriptionBundleFormValues =
  z.infer<typeof subscriptionBundleSchema>