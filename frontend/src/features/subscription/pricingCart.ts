export const GST = 18

export interface CatalogEntry {
  id: string
  kind: "plan" | "bundle" | "addon"
  plan_id: number | null
  bundle_id: number | null
  name: string
  subtitle: string
  period: string
  price: number
  total: number
}

export interface CartItem extends CatalogEntry {
  cartItemId: number
}

export interface ServerCartItem {
  id: number
  item_type: "plan" | "bundle"
  plan_id: number | null
  bundle_id: number | null
  item_name: string
  item_code: string | null
  license_type: "subscription" | "perpetual"
  quantity: number | null
  unit_price: number
  gst_percentage: number
  gst_amount: number
  line_total: number
}

export interface ActiveSubscription {
  id: number
  subscription_type: "plan" | "bundle"
  plan_id: number | null
  bundle_id: number | null
  license_type: "subscription" | "perpetual"
  start_date: string
  expiry_date: string | null
  amount_paid: number | null
  amc_start_date: string | null
  amc_end_date: string | null
}

export type CreditType = "whatsapp"

export interface CreditPlan {
  id: number
  plan_name: string
  credits: number
  start_date: string
  expiry_date: string | null
}

export interface CreditStatus {
  remaining: number
  expiry_date: string | null
  next: CreditPlan | null
}

export interface ExpiredPlan {
  plan_id: number
  module_id: number
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
  license_type: "subscription" | "perpetual"
  start_date: string
  end_date: string | null
  line_total: number
  amc_start_date: string | null
  amc_end_date: string | null
  modules: UpcomingModule[]
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
}

export interface CheckoutValues {
  payment_mode: string
  transaction_number: string
  payment_date: string
  remarks: string
}

export const PAYMENT_MODES = [
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank Transfer (NEFT / RTGS / IMPS)" },
  { value: "cheque", label: "Cheque" },
  { value: "demand_draft", label: "Demand Draft" },
  { value: "cash", label: "Cash" },
]

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })
const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })

export const withGst = (price: number) => Math.round(price * (100 + GST)) / 100
export const formatPrice = (value: number | string | null) => currency.format(Number(value ?? 0))
export const formatDate = (value: string) => dateFormat.format(new Date(value))
export const toDateInput = (value: number) => new Date(value - new Date(value).getTimezoneOffset() * 60000).toISOString().slice(0, 10)

export const cartTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0)
  const total = items.reduce((sum, item) => sum + item.total, 0)
  return { subtotal, gst: Math.round((total - subtotal) * 100) / 100, total }
}
