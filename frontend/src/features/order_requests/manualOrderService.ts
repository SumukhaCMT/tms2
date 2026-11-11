import api from "@/axios/axios"
import { toDateInputValue } from "@/features/donations/shared/donationFormLogic"

export interface ManualOrderPlan {
  id: number
  plan_name: string
  plan_code: string
  plan_type: string
  plan_duration_months: string | null
  plan_price: string
  plan_total_price: string
  plan_status: string
}

export interface ManualOrderOrganization {
  id: number
  org_name: string
  billing_name: string
  org_gst_number: string | null
  org_email: string | null
  org_phone: string | null
  org_address_line1: string | null
  org_address_line2: string | null
  org_city: string | null
  org_state: string | null
  org_country: string | null
}

export interface ManualOrderRow {
  id: number
  order_number: string
  organization_name: string
  placed_by_name: string
  payment_method: string
  payment_status: string
  order_status: string
  grand_total: string
  placed_at: string
  items: string | null
}

export interface ManualOrderOptions {
  plans: ManualOrderPlan[]
  organizations: ManualOrderOrganization[]
  enums: Record<string, string[]>
}

export interface ManualOrderForm {
  plan_id: string
  license_type: string
  item_type: string
  start_date: string
  organization_id: string
  placed_by_name: string
  order_number: string
  payment_method: string
  order_status: string
  payment_status: string
  manual_payment_mode: string
  manual_payment_date: string
  manual_payment_recorded_by_name: string
  payment_gateway: string
  gateway_order_id: string
  gateway_payment_id: string
  gateway_signature: string
  gateway_full_response: string
  billing_name: string
  billing_gst_number: string
  billing_email: string
  billing_phone: string
  billing_address_line1: string
  billing_address_line2: string
  billing_city: string
  billing_state: string
  billing_country: string
  note: string
  paid_at: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

const BASE_URL = "/v1/order-requests/manual"

export const getManualOrders = (search: string) =>
  api
    .get<ApiResponse<ManualOrderRow[]>>(BASE_URL, { params: search ? { search } : undefined })
    .then((response) => response.data.data)

export const getManualOrderOptions = () =>
  api.get<ApiResponse<ManualOrderOptions>>(`${BASE_URL}/options`).then((response) => response.data.data)

const toPayload = (form: ManualOrderForm) => ({ ...form, paid_at: new Date(form.paid_at).toISOString() })

const toLocalDateTime = (value: string | null) => {
  if (!value) return ""
  const date = new Date(value)
  return `${toDateInputValue(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

export const emptyManualOrderForm = (userName: string): ManualOrderForm => ({
  plan_id: "",
  license_type: "",
  item_type: "plan",
  start_date: toDateInputValue(new Date()),
  organization_id: "",
  placed_by_name: userName,
  order_number: `ORD-${new Date().getFullYear()}-${Date.now()}`,
  payment_method: "manual",
  order_status: "confirmed",
  payment_status: "paid",
  manual_payment_mode: "",
  manual_payment_date: toDateInputValue(new Date()),
  manual_payment_recorded_by_name: userName,
  payment_gateway: "",
  gateway_order_id: "",
  gateway_payment_id: "",
  gateway_signature: "",
  gateway_full_response: "",
  billing_name: "",
  billing_gst_number: "",
  billing_email: "",
  billing_phone: "",
  billing_address_line1: "",
  billing_address_line2: "",
  billing_city: "",
  billing_state: "",
  billing_country: "India",
  note: "",
  paid_at: toLocalDateTime(new Date().toISOString()),
})

export const createManualOrder = (form: ManualOrderForm) =>
  api
    .post<ApiResponse<{ id: number; order_number: string }>>(BASE_URL, toPayload(form))
    .then((response) => response.data.data)

export const updateManualOrder = (id: number, form: ManualOrderForm) =>
  api
    .put<ApiResponse<{ id: number; order_number: string }>>(`${BASE_URL}/${id}`, toPayload(form))
    .then((response) => response.data.data)

export const getManualOrder = (id: number) =>
  api.get<ApiResponse<Record<string, string | number | null>>>(`${BASE_URL}/${id}`).then(({ data }) => {
    const row = data.data
    const form = Object.fromEntries(
      Object.keys(emptyManualOrderForm("")).map((key) => [key, row[key] === null || row[key] === undefined ? "" : String(row[key])])
    ) as unknown as ManualOrderForm
    return { ...form, paid_at: toLocalDateTime(row.paid_at as string | null) }
  })

export const downloadOrderAcknowledgement = (id: number, orderNumber: string) =>
  api.get<Blob>(`/v1/order-requests/${id}/acknowledgement`, { responseType: "blob" }).then(({ data }) => {
    const url = URL.createObjectURL(data)
    const link = document.createElement("a")
    link.href = url
    link.download = `${orderNumber}-acknowledgement.pdf`
    link.click()
    URL.revokeObjectURL(url)
  })
