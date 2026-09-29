


import { useEffect } from "react"
import {
  useDispatch,
  useSelector,
} from "react-redux"
import {
  useNavigate,
  useParams,
} from "react-router-dom"

import type { AppDispatch } from "@/app/store"

import {
  fetchModulesList,
} from "../../modules/moduleThunks"

import {
  selectSelectedSubscriptionPlan,
  selectSubscriptionPlansLoading,
} from "../subscriptionPlanSelectors"

import {
  editSubscriptionPlan,
  fetchSubscriptionPlanById,
} from "../subscriptionPlanThunks"

import type {
  SubscriptionPlan,
} from "../subscriptionPlanTypes"

import type {
  SubscriptionPlanFormData,
} from "../subscriptionPlanValidation"

import SubscriptionPlanForm from "../components/SubscriptionPlansForm"

export default function EditSubscriptionPlans() {
  const { id } = useParams<{
    id: string
  }>()

  const navigate = useNavigate()

  const dispatch =
    useDispatch<AppDispatch>()

  const plan = useSelector(
    selectSelectedSubscriptionPlan,
  )

  const loading = useSelector(
    selectSubscriptionPlansLoading,
  )

  useEffect(() => {
    if (!id) {
      return
    }

    const planId = Number(id)

    if (!Number.isInteger(planId)) {
      return
    }

    void dispatch(
      fetchSubscriptionPlanById(planId),
    )

    void dispatch(
      fetchModulesList(),
    )
  }, [dispatch, id])

  /**
   * Normalize API/MySQL numeric values.
   *
   * MySQL DECIMAL values can come from the API
   * as strings such as "12.00".
   */
  const normalizedPlan: SubscriptionPlan | null =
    plan
      ? {
          ...plan,

          id: Number(plan.id),

          // module_id:
          //   plan.module_id !== null &&
          //   plan.module_id !== undefined
          //     ? Number(plan.module_id)
          //     : null,
module_id:
  Number(plan.module_id) || 0,
          plan_quantity:
            plan.plan_quantity !== null &&
            plan.plan_quantity !== undefined
              ? Number(plan.plan_quantity)
              : null,

          plan_duration_months:
            plan.plan_duration_months !== null &&
            plan.plan_duration_months !== undefined
              ? Number(
                  plan.plan_duration_months,
                )
              : null,

          plan_price:
            Number(plan.plan_price) || 0,

          plan_gst_percentage:
            Number(
              plan.plan_gst_percentage,
            ) || 0,

          plan_total_price:
            Number(
              plan.plan_total_price,
            ) || 0,

          plan_amc_price:
            plan.plan_amc_price !== null &&
            plan.plan_amc_price !== undefined
              ? Number(
                  plan.plan_amc_price,
                )
              : null,

          plan_amc_duration_months:
            plan.plan_amc_duration_months !== null &&
            plan.plan_amc_duration_months !== undefined
              ? Number(
                  plan.plan_amc_duration_months,
                )
              : null,

          plan_amc_gst_percentage:
            Number(
              plan.plan_amc_gst_percentage,
            ) || 0,

          plan_amc_start_date:
            plan.plan_amc_start_date
              ? String(
                  plan.plan_amc_start_date,
                )
              : null,

          plan_status:
            plan.plan_status === "inactive"
              ? "inactive"
              : "active",
        }
      : null

  const handleSubmit = async (
    data: SubscriptionPlanFormData,
  ) => {
    if (!id) {
      return
    }

    const planId = Number(id)

    if (!Number.isInteger(planId)) {
      return
    }

    const result = await dispatch(
      editSubscriptionPlan({
        id: planId,
        data,
      }),
    )

    if (
      editSubscriptionPlan.fulfilled.match(
        result,
      )
    ) {
      navigate(
        "/subscriptionPlans",
      )
    }
  }

  if (!normalizedPlan) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Loading subscription plan..."
            : "Subscription plan not found."}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <SubscriptionPlanForm
        initialData={normalizedPlan}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate(
            "/subscriptionPlans",
          )
        }
      />
    </div>
  )
}