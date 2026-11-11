import { z } from "zod"

const required = (label: string) => z.string().trim().min(1, `${label} is required`)
const optional = z.string().trim().nullish().transform((value) => value || null)
const date = (label: string) => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, `${label} must be a valid date`)

export const manualOrderSchema = z
  .object({
    plan_id: z.coerce.number().int().positive("Plan is required"),
    license_type: required("License type"),
    item_type: required("Item type"),
    start_date: date("Start date"),

    organization_id: z.coerce.number().int().positive("Organization is required"),
    placed_by_name: required("Placed by name").max(150),
    order_number: required("Order number").max(30),
    payment_method: z.enum(["manual", "gateway"]),
    order_status: required("Order status"),
    payment_status: required("Payment status"),

    manual_payment_mode: optional,
    manual_payment_date: optional,
    manual_payment_recorded_by_name: optional,

    payment_gateway: optional,
    gateway_order_id: optional,
    gateway_payment_id: optional,
    gateway_signature: optional,
    gateway_full_response: optional,

    billing_name: required("Billing name").max(150),
    billing_gst_number: optional,
    billing_email: z.string().trim().email("Enter a valid email"),
    billing_phone: required("Phone").max(20),
    billing_address_line1: required("Billing address 1").max(255),
    billing_address_line2: optional,
    billing_city: required("City").max(100),
    billing_state: required("State").max(100),
    billing_country: required("Country").max(100),
    note: optional,
    paid_at: z.string().min(1, "Paid at is required").refine((value) => !Number.isNaN(Date.parse(value)), "Paid at must be a valid date"),
  })
  .superRefine((data, ctx) => {
    const need = (field: keyof typeof data, label: string) =>
      !data[field] && ctx.addIssue({ code: "custom", path: [field], message: `${label} is required` })

    if (data.payment_method === "manual") {
      need("manual_payment_mode", "Manual payment mode")
      need("manual_payment_date", "Manual payment date")
      need("manual_payment_recorded_by_name", "Recorded by name")
    } else {
      need("payment_gateway", "Payment gateway")
      need("gateway_order_id", "Gateway order id")
      need("gateway_payment_id", "Gateway payment id")
    }
  })

export type ManualOrderInput = z.infer<typeof manualOrderSchema>
