import { z } from "zod"

const phoneRegex = /^\+?[1-9]\d{9,14}$/

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

const orderItemSchema = z.object({
  plan_id: z
    .number()
    .int()
    .positive()
    .optional(),

  bundle_id: z
    .number()
    .int()
    .positive()
    .optional(),

  item_name: z
    .string()
    .trim()
    .min(1, "Item name is required"),

  item_code: z
    .string()
    .trim()
    .min(1, "Item code is required"),

  license_type: z
    .string()
    .trim()
    .min(1, "License type is required"),

  quantity: z
    .number()
    .int()
    .positive()
    .default(1),

  unit_price: z
    .number()
    .min(0),

  gst_percentage: z
    .number()
    .min(0)
    .max(100),

  start_date: z
    .string()
    .regex(dateRegex, "Invalid start date")
    .nullable()
    .optional(),

  end_date: z
    .string()
    .regex(dateRegex, "Invalid end date")
    .nullable()
    .optional(),
})

export const createOrganizationSchema = z.object({
  org_name: z
    .string()
    .trim()
    .min(2, "Organization name is required")
    .max(255),

  org_img_name: z
    .string()
    .nullable()
    .optional(),

  org_legal_name: z
    .string()
    .nullable()
    .optional(),

  user_name: z
    .string()
    .trim()
    .min(2, "User name is required")
    .max(255),

  org_registration_number: z
    .string()
    .nullable()
    .optional(),

  org_gst_number: z
    .string()
    .nullable()
    .optional(),

  org_email: z
    .string()
    .trim()
    .email("Invalid email")
    .nullable()
    .optional(),

  org_phone: z
    .string()
    .trim()
    .regex(
      phoneRegex,
      "Invalid phone number",
    )
    .nullable()
    .optional(),

  org_address_line1: z
    .string()
    .nullable()
    .optional(),

  org_address_line2: z
    .string()
    .nullable()
    .optional(),

  org_city: z
    .string()
    .nullable()
    .optional(),

  org_state: z
    .string()
    .nullable()
    .optional(),

  org_country: z
    .string()
    .nullable()
    .optional(),

  org_pincode: z
    .string()
    .nullable()
    .optional(),

  org_status: z
    .enum([
      "active",
      "inactive",
    ])
    .default("active"),

  org_timezone: z
    .string()
    .default("Asia/Kolkata"),

  order: z.object({
    item_type: z.enum([
      "plan",
      "bundle",
    ]),

    items: z
      .array(orderItemSchema)
      .min(
        1,
        "At least one order item is required",
      ),

    payment_method: z.literal("manual"),

    manual_payment_mode: z
      .string()
      .nullable()
      .optional(),

    billing_name: z
      .string()
      .trim()
      .min(1, "Billing name is required"),

    billing_email: z
      .string()
      .trim()
      .email("Invalid billing email"),

    billing_address: z
      .string()
      .trim()
      .min(1, "Billing address is required"),
billing_address2: z
  .string()
  .trim()
  .max(
    255,
    "Billing address 2 must not exceed 255 characters.",
  )
  .optional(),
    billing_city: z
      .string()
      .trim()
      .min(1, "Billing city is required"),

    billing_state: z
      .string()
      .trim()
      .min(1, "Billing state is required"),

    billing_country: z
      .string()
      .trim()
      .min(1, "Billing country is required"),

    billing_pincode: z
      .string()
      .trim()
      .min(1, "Billing pincode is required"),

    manual_payment_reference: z
      .string()
      .trim()
      .min(
        1,
        "Payment reference is required",
      ),

    manual_payment_date: z
      .string()
      .regex(
        dateRegex,
        "Invalid payment date",
      ),

    start_date: z
      .string()
      .regex(
        dateRegex,
        "Invalid start date",
      )
      .nullable()
      .optional(),

    note: z
      .string()
      .nullable()
      .optional(),
  }),
})

export const updateOrganizationSchema = z.object({
  org_name: z
    .string()
    .trim()
    .min(2, "Organization name is required")
    .max(255)
    .optional(),

  org_img_name: z
    .string()
    .nullable()
    .optional(),

  org_legal_name: z
    .string()
    .nullable()
    .optional(),

  org_registration_number: z
    .string()
    .nullable()
    .optional(),

  org_gst_number: z
    .string()
    .nullable()
    .optional(),

  org_email: z
    .string()
    .trim()
    .email("Invalid email")
    .nullable()
    .optional(),

  org_phone: z
    .string()
    .trim()
    .regex(
      phoneRegex,
      "Invalid phone number",
    )
    .nullable()
    .optional(),

  org_address_line1: z
    .string()
    .nullable()
    .optional(),

  org_address_line2: z
    .string()
    .nullable()
    .optional(),

  org_city: z
    .string()
    .nullable()
    .optional(),

  org_state: z
    .string()
    .nullable()
    .optional(),

  org_country: z
    .string()
    .nullable()
    .optional(),

  org_pincode: z
    .string()
    .nullable()
    .optional(),

  org_status: z
    .enum([
      "active",
      "inactive",
    ])
    .optional(),

  org_timezone: z
    .string()
    .optional(),
})