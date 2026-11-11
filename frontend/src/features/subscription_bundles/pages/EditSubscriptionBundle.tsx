



import { useEffect, useMemo } from "react"
import {
  useNavigate,
  useParams,
} from "react-router-dom"
import {
  useDispatch,
  useSelector,
} from "react-redux"

import type { AppDispatch } from "@/app/store"

import SubscriptionBundleForm from "../components/SubscriptionBundleForm"

import {
  fetchSubscriptionBundleById,
  updateSubscriptionBundle,
} from "../subscriptionBundleThunks"

import { fetchSubscriptionPlans } from "../../subscription/subscriptionPlanThunks"

import {
  selectSelectedSubscriptionBundle,
  selectSubscriptionBundleLoading,
  selectSubscriptionPlansLoading,
} from "../subscriptionBundleSelectors"

import type { SubscriptionBundle } from "../subscriptionBundleTypes"

import type {
  SubscriptionBundleFormValues,
} from "../subscriptionBundleValidation"
import { showCmtToast } from "@/components/ui/cmt-toast"

export default function EditSubscriptionBundle() {
  const { id } = useParams<{
    id: string
  }>()

  const navigate = useNavigate()

  const dispatch = useDispatch<AppDispatch>()

  /*
   * ============================================================
   * SELECTORS
   * ============================================================
   */

  const bundle = useSelector(
    selectSelectedSubscriptionBundle,
  )

  const bundleLoading = useSelector(
    selectSubscriptionBundleLoading,
  )

  const plansLoading = useSelector(
    selectSubscriptionPlansLoading,
  )

  const loading =
    bundleLoading || plansLoading

  /*
   * ============================================================
   * BUNDLE ID
   * ============================================================
   */

  const bundleId = id
    ? Number(id)
    : NaN

  const validBundleId =
    Number.isInteger(bundleId) &&
    bundleId > 0

  /*
   * ============================================================
   * FETCH BUNDLE + PLANS
   * ============================================================
   */

  useEffect(() => {
    if (!validBundleId) {
      return
    }

    void dispatch(
      fetchSubscriptionBundleById(
        bundleId,
      ),
    )

    void dispatch(
      fetchSubscriptionPlans(),
    )
  }, [
    dispatch,
    bundleId,
    validBundleId,
  ])

  /*
   * ============================================================
   * NORMALIZE API DATA
   * ============================================================
   *
   * MySQL DECIMAL values can arrive as strings.
   *
   * Example:
   *
   * "5000.00"
   *
   * must become:
   *
   * 5000
   */

  const normalizedBundle =
    useMemo<SubscriptionBundle | null>(() => {
      if (!bundle) {
        return null
      }

      return {
        ...bundle,

        id: Number(bundle.id),

        bundle_name:
          bundle.bundle_name ?? "",

        bundle_code:
          bundle.bundle_code ?? "",

        bundle_type:
          bundle.bundle_type === "perpetual"
            ? "perpetual"
            : "subscription",

        bundle_duration_months:
          bundle.bundle_duration_months !=
          null
            ? Number(
                bundle.bundle_duration_months,
              )
            : null,

        bundle_price:
          bundle.bundle_price != null
            ? Number(
                bundle.bundle_price,
              )
            : 0,

        bundle_gst_percentage:
          bundle.bundle_gst_percentage !=
          null
            ? Number(
                bundle.bundle_gst_percentage,
              )
            : 0,

        bundle_total_price:
          bundle.bundle_total_price !=
          null
            ? Number(
                bundle.bundle_total_price,
              )
            : 0,

        bundle_amc_price:
          bundle.bundle_amc_price !=
          null
            ? Number(
                bundle.bundle_amc_price,
              )
            : null,

        bundle_amc_duration_months:
          bundle.bundle_amc_duration_months !=
          null
            ? Number(
                bundle.bundle_amc_duration_months,
              )
            : null,

        bundle_amc_gst_percentage:
          bundle.bundle_amc_gst_percentage !=
          null
            ? Number(
                bundle.bundle_amc_gst_percentage,
              )
            : null,

        bundle_amc_start_date:
          bundle.bundle_amc_start_date ??
          null,

        bundle_status:
          bundle.bundle_status === "inactive"
            ? "inactive"
            : "active",

        plan_ids:
          Array.isArray(bundle.plan_ids)
            ? bundle.plan_ids
                .filter(
                  (planId) =>
                    planId != null,
                )
                .map(Number)
                .filter(
                  (planId) =>
                    Number.isInteger(planId),
                )
            : [],
      }
    }, [bundle])

  /*
   * ============================================================
   * INVALID ID
   * ============================================================
   */

  if (!validBundleId) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-destructive">
          Invalid subscription bundle ID.
        </p>

        <button
          type="button"
          className="mt-4 cursor-pointer text-sm underline"
          onClick={() =>
            navigate(
              "/subscription_bundles",
            )
          }
        >
          Back to Subscription Bundles
        </button>
      </div>
    )
  }

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (
    bundleLoading &&
    !normalizedBundle
  ) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading subscription bundle...
        </p>
      </div>
    )
  }

  /*
   * ============================================================
   * NOT FOUND
   * ============================================================
   */

  if (!normalizedBundle) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-destructive">
          Subscription bundle not found.
        </p>

        <button
          type="button"
          className="mt-4 cursor-pointer text-sm underline"
          onClick={() =>
            navigate(
              "/subscription_bundles",
            )
          }
        >
          Back to Subscription Bundles
        </button>
      </div>
    )
  }

  /*
   * ============================================================
   * SUBMIT
   * ============================================================
   */

  const handleSubmit = async (
    data: SubscriptionBundleFormValues,
  ) => {
    console.log(
      "SUBSCRIPTION BUNDLE UPDATE REQUEST:",
      {
        id: bundleId,
        data,
      },
    )

    try {
      const result = await dispatch(
        updateSubscriptionBundle({
          id: bundleId,
          data,
        }),
      )

      if (
        updateSubscriptionBundle.fulfilled.match(
          result,
        )
      ) {
        console.log(
          "SUBSCRIPTION BUNDLE UPDATED:",
          result.payload,
        )
        showCmtToast("success", "Subscription bundle updated successfully.")

        navigate(
          "/subscription_bundles",
        )

        return
      }

      console.error(
        "SUBSCRIPTION BUNDLE UPDATE FAILED:",
        result.payload,
      )
    } catch (error) {
      console.error(
        "SUBSCRIPTION BUNDLE UPDATE ERROR:",
        error,
      )
    }
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="w-full space-y-6">
      <SubscriptionBundleForm
        initialData={normalizedBundle}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate(
            "/subscription_bundles",
          )
        }
      />
    </div>
  )
}