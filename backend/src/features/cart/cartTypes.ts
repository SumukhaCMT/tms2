export type CartItemType = "plan" | "bundle"

export type LicenseType = "subscription" | "perpetual"

export interface CatalogItem {
  item_type: CartItemType
  plan_id: number | null
  bundle_id: number | null
  item_name: string
  item_code: string
  license_type: LicenseType
  duration_months: number | null
  quantity: number | null
  unit_price: number
  gst_percentage: number
  gst_amount: number
  line_total: number
  snapshot: string
}

export interface CartItem {
  id: number
  item_type: CartItemType
  plan_id: number | null
  bundle_id: number | null
  item_name: string
  item_code: string | null
  license_type: LicenseType
  quantity: number | null
  unit_price: number
  gst_percentage: number
  gst_amount: number
  line_total: number
}

export interface AddCartItemInput {
  plan_id?: number
  bundle_id?: number
  replace_ids: number[]
}

export type PaymentMode = "cash" | "cheque" | "bank_transfer" | "upi" | "gpay" | "netbanking" | "demand_draft" | "other"

export interface CheckoutInput {
  payment_mode: PaymentMode
  transaction_number: string
  payment_date: string
  remarks: string
}

export interface OrgBilling {
  org_name: string
  billing_name: string
  org_gst_number: string | null
  org_email: string | null
  org_phone: string | null
  org_address_line1: string | null
  org_address_line2: string | null
  org_city: string | null
  org_state: string | null
  org_country: string
  org_pincode: string | null
}

export interface CreateOrderInput extends CheckoutInput {
  organization_id: number
  order_number: string
  placed_by_name: string
  subtotal: number
  total_gst_amount: number
  grand_total: number
  billing: OrgBilling
}

export interface CreateOrderItemInput {
  order_id: number
  line: CatalogItem
  start_date: string
  end_date: string | null
}

export interface ActiveSubscription {
  id: number
  subscription_type: CartItemType
  plan_id: number | null
  bundle_id: number | null
  license_type: LicenseType
  start_date: string
  expiry_date: string | null
  amount_paid: number | null
  amc_start_date: string | null
  amc_end_date: string | null
}

export interface UpcomingPlan {
  id: number
  order_number: string
  order_status: string
  payment_status: string
  placed_on: string
  item_type: "plan" | "bundle"
  plan_id: number | null
  bundle_id: number | null
  item_name: string
  license_type: LicenseType
  start_date: string
  end_date: string | null
  line_total: number
  module_data?: string | null
  amc_start_date: string | null
  amc_end_date: string | null
}

export interface UpcomingModule {
  plan_name: string
  start_date: string
  end_date: string | null
}

export interface PlacedOrder {
  id: number
  order_number: string
  grand_total: number
  payment_mode: PaymentMode
  transaction_number: string
  payment_date: string
}

export type CreditType = "whatsapp"

export interface CreditSubscription {
  id: number
  plan_name: string
  granted_quantity: number
  remaining_quantity: number
  start_date: string
  expiry_date: string | null
  is_live: number
}
