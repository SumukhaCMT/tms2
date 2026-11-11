export type BundleType = "subscription" | "perpetual";

export type BundleStatus = "active" | "inactive";

export interface CreateSubscriptionBundlePayload {
  bundle_name: string;
  bundle_code: string;
  bundle_type: BundleType;

  bundle_duration_months?: number | null;

  bundle_price: number;
  bundle_gst_percentage?: number;

  bundle_total_price: number;

  bundle_amc_price?: number | null;
  bundle_amc_duration_months?: number | null;
  bundle_amc_gst_percentage?: number | null;

  bundle_status?: BundleStatus;

  plan_ids: number[];
}

export interface UpdateSubscriptionBundlePayload {
  bundle_name?: string;
  bundle_code?: string;
  bundle_type?: BundleType;

  bundle_duration_months?: number | null;

  bundle_price?: number;
  bundle_gst_percentage?: number;

  bundle_total_price?: number;

  bundle_amc_price?: number | null;
  bundle_amc_duration_months?: number | null;
  bundle_amc_gst_percentage?: number | null;

  bundle_status?: BundleStatus;

  plan_ids?: number[];
}

export interface SubscriptionBundle {
  id: number;
  bundle_name: string;
  bundle_code: string;
  bundle_type: BundleType;
  bundle_duration_months: number | null;
  bundle_price: number;
  bundle_gst_percentage: number;
  bundle_total_price: number;

  bundle_amc_price: number | null;
  bundle_amc_duration_months: number | null;
  bundle_amc_gst_percentage: number | null;

  bundle_amc_start_date: string | null;

  bundle_status: BundleStatus;

  created_at: string;
  updated_at: string;
}

export interface SubscriptionBundleItem {
  id: number;
  bundle_id: number;
  plan_id: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionBundlePlan {
  id: number;
  plan_name: string;
  plan_code: string;
  plan_type: BundleType;
  module_name: string | null;
  plan_quantity: number | null;
  plan_duration_months: number | null;
  plan_price: number;
  plan_gst_percentage: number;
  plan_total_price: number;
  plan_status: BundleStatus;
}

export interface SubscriptionBundleWithPlans
  extends SubscriptionBundle {
  plan_ids: number[];
  plans: SubscriptionBundlePlan[];
}