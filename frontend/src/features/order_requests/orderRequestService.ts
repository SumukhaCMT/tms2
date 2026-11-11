import api from "@/axios/axios"

export interface OrderRequest {
  id: number
  order_number: string
  organization_id: number
  organization_name: string
  placed_by_name: string
  grand_total: string
  manual_payment_mode: string | null
  manual_payment_reference: string | null
  manual_payment_date: string | null
  created_at: string
  items: string
}

export interface OrderRequestItem {
  id: number
  item_type: string
  item_name: string
  item_code: string | null
  license_type: string
  quantity: number | null
  start_date: string
  end_date: string | null
  unit_price: string
  gst_percentage: string
  gst_amount: string
  line_total: string
  amc_start_date: string | null
  amc_end_date: string | null
}

export interface OrderRequestDetails {
  id: number
  order_number: string
  organization_id: number
  organization_name: string
  placed_by_name: string
  order_status: string
  payment_status: string
  payment_method: string
  manual_payment_mode: string | null
  manual_payment_reference: string | null
  manual_payment_date: string | null
  manual_payment_recorded_by_name: string | null
  subtotal: string
  total_gst_amount: string
  grand_total: string
  currency: string
  billing_name: string | null
  billing_gst_number: string | null
  billing_email: string | null
  billing_phone: string | null
  billing_address_line1: string | null
  billing_address_line2: string | null
  billing_city: string | null
  billing_state: string | null
  billing_country: string | null
  billing_pincode: string | null
  note: string | null
  created_at: string
  items: OrderRequestItem[]
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

const BASE_URL = "/v1/order-requests"

export const getOrderRequests = () => api.get<ApiResponse<OrderRequest[]>>(BASE_URL).then((response) => response.data.data)

export const getOrderRequest = (id: number) =>
  api.get<ApiResponse<OrderRequestDetails>>(`${BASE_URL}/${id}`).then((response) => response.data.data)

export const acceptOrderRequest = (id: number) => api.post(`${BASE_URL}/${id}/accept`)

export const rejectOrderRequest = (id: number) => api.post(`${BASE_URL}/${id}/reject`)
