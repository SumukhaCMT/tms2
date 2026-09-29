import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  NavLink,
  useNavigate,
  useParams,
} from "react-router-dom"

import type { AppDispatch } from "@/app/store"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  fetchSubscriptionPlanById,
} from "../subscriptionPlanThunks"

import {
  selectSelectedSubscriptionPlan,
  selectSubscriptionPlansError,
  selectSubscriptionPlansLoading,
} from "../subscriptionPlanSelectors"

export default function ViewSubscriptionPlans() {
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

  const error = useSelector(
    selectSubscriptionPlansError,
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
      fetchSubscriptionPlanById(
        planId,
      ),
    )
  }, [dispatch, id])

  if (loading && !plan) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading subscription plan...
        </p>
      </div>
    )
  }

  if (error && !plan) {
    return (
      <div className="rounded-md border border-destructive/30 p-6 text-center">

        <p className="text-sm text-destructive">
          {error}
        </p>

        <Button
          className="mt-4"
          onClick={() =>
            navigate(
              "/subscription-plans",
            )
          }
        >
          Back
        </Button>

      </div>
    )
  }

  if (!plan) {
    return (
      <div className="rounded-md border p-6 text-center">
        Subscription plan not found......
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-semibold">
            Subscription Plan Details
          </h1>

          <p className="text-sm text-muted-foreground">
            View subscription plan information.
          </p>
        </div>

        <div className="flex gap-2">

          <Button
            variant="outline"
           
          >
            <NavLink to="/subscriptionPlans">
              Back
            </NavLink>
          </Button>

          <Button  className="cursor-pointer">
            <NavLink
              to={`/subscriptionPlans/edit/${plan.id}`}
            >
              Edit
            </NavLink>
          </Button>

        </div>

      </div>

      <Card>

        <CardHeader>
          <CardTitle>
            {plan.plan_name}
          </CardTitle>
        </CardHeader>

        <CardContent>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

            <Detail
              label="Plan Name"
              value={plan.plan_name}
            />

            <Detail
              label="Plan Code"
              value={plan.plan_code}
            />

            <Detail
              label="Module ID"
              value={String(plan.module_id)}
            />

            <Detail
              label="Plan Type"
              value={plan.plan_type}
            />

            <Detail
              label="Quantity"
              value={
                plan.plan_quantity === null
                  ? "-"
                  : String(
                      plan.plan_quantity,
                    )
              }
            />

            <Detail
              label="Duration"
              value={
                plan.plan_duration_months ===
                null
                  ? "-"
                  : `${plan.plan_duration_months} Months`
              }
            />

            <Detail
              label="Plan Price"
              value={`₹${Number(
                plan.plan_price,
              ).toFixed(2)}`}
            />

            <Detail
              label="GST"
              value={`${Number(
                plan.plan_gst_percentage,
              ).toFixed(2)}%`}
            />

            <Detail
              label="Total Price"
              value={`₹${Number(
                plan.plan_total_price,
              ).toFixed(2)}`}
            />

            <Detail
              label="AMC Price"
              value={
                plan.plan_amc_price === null
                  ? "-"
                  : `₹${Number(
                      plan.plan_amc_price,
                    ).toFixed(2)}`
              }
            />

            <Detail
              label="AMC Duration"
              value={
                plan.plan_amc_duration_months ===
                null
                  ? "-"
                  : `${plan.plan_amc_duration_months} Months`
              }
            />

            <Detail
              label="AMC GST"
              value={`${Number(
                plan.plan_amc_gst_percentage,
              ).toFixed(2)}%`}
            />

           <Detail
  label="AMC Start Date"
  value={
    plan.plan_amc_start_date
      ? new Date(plan.plan_amc_start_date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).replace(/ /g, "-")
      : "-"
  }
/>

            <Detail
              label="Status"
              value={plan.plan_status}
            />

          </div>

        </CardContent>

      </Card>

    </div>
  )
}

function Detail({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-md border p-4">

      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-medium capitalize">
        {value}
      </p>

    </div>
  )
}