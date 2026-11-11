import api from "@/axios/axios"

export interface OrgDashboardSummary {
  donation_amount: number
  booking_amount: number
  token_amount: number
  hundi_amount: number
  bookings: number
  upcoming_bookings: number
  today_bookings: number
  unpaid_bookings: number
  hundis: number
  hundi_openings: number
  hundi_counted: number
  inventory_items: number
  inventory_stock: number
  out_of_stock: number
  subscriptions: number
  next_expiry: string | null
}

export interface OrgDashboardSlice {
  name: string
  value: number
  count?: number
}

export interface OrgDashboardMonth {
  month: string
  donations: number
  bookings: number
  tokens: number
  hundi: number
}

export interface OrgDashboardTemple {
  id: number
  temp_name: string
  temp_status: string
  donation_amount: number
  bookings: number
  booking_amount: number
  tokens: number
  token_amount: number
  hundi_amount: number
}

export interface OrgDashboardData {
  summary: OrgDashboardSummary
  monthly: OrgDashboardMonth[]
  temples: OrgDashboardTemple[]
  bookingStatus: OrgDashboardSlice[]
  paymentMethods: OrgDashboardSlice[]
  topSevas: OrgDashboardSlice[]
}

export const getOrgDashboard = async () => {
  const res = await api.get<{ data: OrgDashboardData }>("/v1/dashboard/org")
  return res.data.data
}
