


export type PlanType =
  | "subscription"
  | "perpetual"

export type PlanStatus =
  | "active"
  | "inactive"

export interface SubscriptionPlan {
  id: number
  module_id: number

  plan_name: string
  plan_code: string
  plan_type: PlanType

  plan_quantity: number | null
  plan_duration_months: number | null

  plan_price: number
  plan_gst_percentage: number
  plan_total_price: number

  plan_amc_price: number | null
  plan_amc_duration_months: number | null
  plan_amc_gst_percentage: number | null
  plan_amc_start_date: string | null

  plan_status: PlanStatus

  created_at?: string | Date
  updated_at?: string | Date

  message?: string
}

export interface CreateSubscriptionPlanPayload {
  module_id: number

  plan_name: string
  plan_code: string
  plan_type: PlanType

  plan_quantity: number | null
  plan_duration_months: number | null

  plan_price: number
  plan_gst_percentage: number
  plan_total_price?: number

  plan_amc_price: number | null
  plan_amc_duration_months: number | null
  plan_amc_gst_percentage: number | null
  plan_amc_start_date: string | null

  plan_status?: PlanStatus
}

export interface UpdateSubscriptionPlanPayload {
  module_id?: number

  plan_name?: string
  plan_code?: string
  plan_type?: PlanType

  plan_quantity?: number | null
  plan_duration_months?: number | null

  plan_price?: number
  plan_gst_percentage?: number
  plan_total_price?: number

  plan_amc_price?: number | null
  plan_amc_duration_months?: number | null
  plan_amc_gst_percentage?: number | null
  plan_amc_start_date?: string | null

  plan_status?: PlanStatus
}