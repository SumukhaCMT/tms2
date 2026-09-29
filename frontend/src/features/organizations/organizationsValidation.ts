import * as z from "zod"

/* =========================================================
   STEP 1 - ORGANIZATION
========================================================= */

export const registrationOrganizationSchema =
  z.object({
    organization_name: z
      .string()
      .trim()
      .min(
        2,
        "Organization name must be at least 2 characters.",
      )
      .max(
        150,
        "Organization name must be at most 150 characters.",
      ),

    contact_person_name: z
      .string()
      .trim()
      .min(
        2,
        "Contact person name must be at least 2 characters.",
      )
      .max(
        100,
        "Contact person name must be at most 100 characters.",
      ),

    email: z
      .string()
      .trim()
      .min(
        1,
        "Organization admin email is required.",
      )
      .email(
        "Enter a valid organization email.",
      )
      .max(
        150,
        "Organization admin email must not exceed 150 characters.",
      ),

    phone: z
      .string()
      .trim()
      .min(
        10,
        "Phone number must be at least 10 digits.",
      )
      .max(
        15,
        "Phone number must not exceed 15 digits.",
      )
      .regex(
        /^\+?[1-9]\d{9,14}$/,
        "Enter a valid phone number.",
      ),
  })

/* =========================================================
   STEP 2 - SUBSCRIPTION
========================================================= */

export const registrationSelectionSchema =
  z
    .object({
      selection_type: z.enum(
        ["plan", "bundle"] as const,
        {
          error:
            "Please select a subscription type.",
        },
      ),

      plan_ids: z
        .array(
          z
            .number()
            .int()
            .positive(),
        ),

      bundle_id: z
        .number()
        .int()
        .positive()
        .nullable(),

      bundle_type: z
        .enum(
          [
            "subscription",
            "perpetual",
          ] as const,
        )
        .nullable(),
    })
    .superRefine(
      (
        data,
        ctx,
      ) => {
        /* ---------------------------------------------
           PLAN
        --------------------------------------------- */

        if (
          data.selection_type ===
          "plan"
        ) {
          if (
            data.plan_ids.length ===
            0
          ) {
            ctx.addIssue({
              code:
                z.ZodIssueCode.custom,
              path: [
                "plan_ids",
              ],
              message:
                "Please select at least one subscription plan.",
            })
          }

          if (
            data.bundle_id !==
            null
          ) {
            ctx.addIssue({
              code:
                z.ZodIssueCode.custom,
              path: [
                "bundle_id",
              ],
              message:
                "Bundle must not be selected when using plans.",
            })
          }

          if (
            data.bundle_type !==
            null
          ) {
            ctx.addIssue({
              code:
                z.ZodIssueCode.custom,
              path: [
                "bundle_type",
              ],
              message:
                "Bundle type must be empty when using plans.",
            })
          }
        }

        /* ---------------------------------------------
           BUNDLE
        --------------------------------------------- */

        if (
          data.selection_type ===
          "bundle"
        ) {
          if (
            data.bundle_id ===
            null
          ) {
            ctx.addIssue({
              code:
                z.ZodIssueCode.custom,
              path: [
                "bundle_id",
              ],
              message:
                "Please select one subscription bundle.",
            })
          }

          if (
            data.bundle_type ===
            null
          ) {
            ctx.addIssue({
              code:
                z.ZodIssueCode.custom,
              path: [
                "bundle_type",
              ],
              message:
                "Bundle type is required.",
            })
          }

          if (
            data.plan_ids.length >
            0
          ) {
            ctx.addIssue({
              code:
                z.ZodIssueCode.custom,
              path: [
                "plan_ids",
              ],
              message:
                "Plans must be cleared when using a bundle.",
            })
          }
        }
      },
    )

/* =========================================================
   STEP 3 - PAYMENT
========================================================= */

const dateSchema = (
  message: string,
) =>
  z
    .string()
    .trim()
    .min(
      1,
      message,
    )
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Enter a valid date.",
    )

export const registrationPaymentSchema =
  z.object({
    payment_method:
      z.literal(
        "manual",
      ),

    /* ---------------------------------------------
       BILLING
    --------------------------------------------- */

    billing_name: z
      .string()
      .trim()
      .min(
        2,
        "Billing name must be at least 2 characters.",
      )
      .max(
        150,
        "Billing name must not exceed 150 characters.",
      ),

    billing_email: z
      .string()
      .trim()
      .min(
        1,
        "Billing email is required.",
      )
      .email(
        "Enter a valid billing email.",
      )
      .max(
        150,
        "Billing email must not exceed 150 characters.",
      ),

    billing_address: z
      .string()
      .trim()
      .min(
        5,
        "Billing address must be at least 5 characters.",
      )
      .max(
        255,
        "Billing address must not exceed 255 characters.",
      ),
billing_address2: z
  .string()
  .trim()
  .max(
    255,
    "Billing address must not exceed 255 characters.",
  )
  .optional(),  
    billing_city: z
      .string()
      .trim()
      .min(
        2,
        "City must be at least 2 characters.",
      )
      .max(
        100,
        "City must not exceed 100 characters.",
      ),

    billing_state: z
      .string()
      .trim()
      .min(
        2,
        "State must be at least 2 characters.",
      )
      .max(
        100,
        "State must not exceed 100 characters.",
      ),

    billing_country: z
      .string()
      .trim()
      .min(
        2,
        "Country must be at least 2 characters.",
      )
      .max(
        100,
        "Country must not exceed 100 characters.",
      ),

    billing_pincode: z
      .string()
      .trim()
      .regex(
        /^\d{6}$/,
        "Enter a valid 6-digit pincode.",
      ),

    /* ---------------------------------------------
       PAYMENT
    --------------------------------------------- */

    payment_reference: z
      .string()
      .trim()
      .min(
        2,
        "Payment reference is required.",
      )
      .max(
        100,
        "Payment reference must not exceed 100 characters.",
      ),

    payment_date:
      dateSchema(
        "Payment date is required.",
      ),

    start_date:
      dateSchema(
        "Start date is required.",
      ),

    payment_amount: z
      .number()
      .nullable()
      .refine(
        (
          value,
        ) =>
          value !==
            null &&
          Number.isFinite(
            value,
          ) &&
          value > 0,
        {
          message:
            "Payment amount must be greater than 0.",
        },
      ),

    payment_notes: z
      .string()
      .trim()
      .max(
        500,
        "Payment notes must not exceed 500 characters.",
      ),
  })

/* =========================================================
   COMPLETE FORM
========================================================= */

export const registrationFormSchema =
  z
    .object({
      ...registrationOrganizationSchema.shape,

      selection_type:
        z.enum(
          [
            "plan",
            "bundle",
          ] as const,
        ),

      plan_ids:
        z.array(
          z
            .number()
            .int()
            .positive(),
        ),

      bundle_id:
        z
          .number()
          .int()
          .positive()
          .nullable(),

      bundle_type:
        z
          .enum(
            [
              "subscription",
              "perpetual",
            ] as const,
          )
          .nullable(),

      ...registrationPaymentSchema.shape,
    })
    .superRefine(
      (
        data,
        ctx,
      ) => {
        const result =
          registrationSelectionSchema.safeParse(
            {
              selection_type:
                data.selection_type,

              plan_ids:
                data.plan_ids,

              bundle_id:
                data.bundle_id,

              bundle_type:
                data.bundle_type,
            },
          )

        if (
          !result.success
        ) {
          for (
            const issue of
              result.error.issues
          ) {
            ctx.addIssue({
              code:
                z.ZodIssueCode.custom,

              path:
                issue.path,

              message:
                issue.message,
            })
          }
        }
      },
    )

export type RegistrationFormData =
  z.infer<
    typeof registrationFormSchema
  >

export type RegistrationFormSchema =
  RegistrationFormData

/* =========================================================
   STEP VALIDATION
========================================================= */

export const validateRegistrationStep =
  (
    step:
      | 1
      | 2
      | 3,

    values:
      RegistrationFormSchema,
  ) => {
    switch (step) {
      case 1:
        return registrationOrganizationSchema.safeParse(
          values,
        )

      case 2:
        return registrationSelectionSchema.safeParse(
          {
            selection_type:
              values.selection_type,

            plan_ids:
              values.plan_ids,

            bundle_id:
              values.bundle_id,

            bundle_type:
              values.bundle_type,
          },
        )

      case 3:
        return registrationPaymentSchema.safeParse(
          values,
        )

      default:
        return registrationFormSchema.safeParse(
          values,
        )
    }
  }