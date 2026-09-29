export type SubscriptionPlanType =
  | "subscription"
  | "perpetual"

export type SubscriptionPlanStatus =
  | "active"
  | "inactive"

export interface SubscriptionPlan {
  id: number
  module_id: number
message:string
  plan_name: string
  plan_code: string
  plan_type: SubscriptionPlanType

  plan_quantity: number | null
  plan_duration_months: number | null

  plan_price: number
  plan_gst_percentage: number
  plan_total_price: number

  plan_amc_price: number | null
  plan_amc_duration_months: number | null
  plan_amc_gst_percentage: number
  plan_amc_start_date: string | null

  plan_status: SubscriptionPlanStatus

  created_at?: string
  updated_at?: string
}

export interface CreateSubscriptionPlanPayload {
  module_id: number
  plan_name: string
  plan_code: string
  plan_type: SubscriptionPlanType

  plan_quantity: number | null
  plan_duration_months: number | null

  plan_price: number
  plan_gst_percentage: number
  plan_total_price: number

  plan_amc_price: number | null
  plan_amc_duration_months: number | null
  plan_amc_gst_percentage: number
  plan_amc_start_date: string | null

  plan_status: SubscriptionPlanStatus
}

export type UpdateSubscriptionPlanPayload =
  Partial<CreateSubscriptionPlanPayload>

export interface SubscriptionPlansPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface SubscriptionPlanState {
  plans: SubscriptionPlan[]
  selectedPlan: SubscriptionPlan | null

  loading: boolean
  error: string | null

  pagination: SubscriptionPlansPagination
}