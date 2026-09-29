

export type BundleType = "subscription" | "perpetual"

export type BundleStatus = "active" | "inactive"

export interface SubscriptionPlan {
  id: number
  plan_name: string
  plan_code: string
  plan_type?: string | null
}

export interface SubscriptionBundle {
  id: number

  bundle_name: string
  bundle_code: string

  bundle_type: BundleType

  bundle_duration_months: number | null

  bundle_price: number
  bundle_gst_percentage: number
  bundle_total_price: number

  bundle_amc_price: number | null
  bundle_amc_duration_months: number | null
  bundle_amc_gst_percentage: number | null

  bundle_status: BundleStatus
bundle_amc_start_date: string
  plan_ids: number[]
}

export interface CreateSubscriptionBundlePayload {
  bundle_name: string
  bundle_code: string

  bundle_type: BundleType

  bundle_duration_months: number | null

  bundle_price: number
  bundle_gst_percentage: number
  bundle_total_price: number

  bundle_amc_price: number | null
  bundle_amc_duration_months: number | null
  bundle_amc_gst_percentage: number | null

  bundle_status: BundleStatus

  plan_ids: number[]
}

export interface UpdateSubscriptionBundlePayload
  extends CreateSubscriptionBundlePayload {
  id?: number
}

export interface SubscriptionBundleState {
  bundles: SubscriptionBundle[]
  plans: SubscriptionPlan[]

  selectedBundle: SubscriptionBundle | null

  loading: boolean
  plansLoading: boolean

  error: string | null
}