import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useParams } from "react-router-dom"
import { CalendarClock, IndianRupee, Pencil, Percent, Wrench } from "lucide-react"

import type { AppDispatch } from "@/app/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DetailColumns, DetailPage, DetailSection, DetailStats, formatDetailDate } from "@/components/ui/detail-page"

import { fetchSubscriptionPlanById } from "../subscriptionPlanThunks"
import { selectSelectedSubscriptionPlan, selectSubscriptionPlansError, selectSubscriptionPlansLoading } from "../subscriptionPlanSelectors"

const rupees = (value: number | string | null) => (value === null ? "-" : `₹${Number(value).toFixed(2)}`)
const months = (value: number | null) => (value === null ? "-" : `${value} Months`)

export default function ViewSubscriptionPlans() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const selected = useSelector(selectSelectedSubscriptionPlan)
  const loading = useSelector(selectSubscriptionPlansLoading)
  const error = useSelector(selectSubscriptionPlansError)
  const plan = selected && String(selected.id) === id ? selected : null

  useEffect(() => {
    const planId = Number(id)
    if (Number.isInteger(planId)) void dispatch(fetchSubscriptionPlanById(planId))
  }, [dispatch, id])

  return (
    <DetailPage
      title={plan?.plan_name ?? "Subscription Plan Details"}
      description={plan?.plan_code ?? "Subscription plan information"}
      badges={
        plan && (
          <>
            <Badge variant="secondary" className="capitalize">{plan.plan_type}</Badge>
            <Badge variant={plan.plan_status === "active" ? "default" : "destructive"} className="capitalize">{plan.plan_status}</Badge>
          </>
        )
      }
      actions={
        plan && (
          <Button render={<Link to={`/subscriptionplans/edit/${plan.id}`} />}>
            <Pencil /> Edit
          </Button>
        )
      }
      isLoading={loading && !plan}
      empty={!plan && (error || "Subscription plan not found.")}
    >
      {plan && (
        <>
          <DetailStats
            items={[
              { label: "Plan Price", value: rupees(plan.plan_price), icon: IndianRupee },
              { label: "GST", value: `${Number(plan.plan_gst_percentage).toFixed(2)}%`, icon: Percent },
              { label: "Total Price", value: rupees(plan.plan_total_price), icon: IndianRupee },
              { label: "Duration", value: months(plan.plan_duration_months), icon: CalendarClock },
            ]}
          />

          <DetailColumns
            aside={
              <DetailSection
                title="AMC"
                description="Annual maintenance charges"
                action={<Wrench className="size-4 text-muted-foreground" />}
                fields={[
                  { label: "AMC Price", value: rupees(plan.plan_amc_price) },
                  { label: "AMC GST", value: `${Number(plan.plan_amc_gst_percentage).toFixed(2)}%` },
                  { label: "AMC Duration", value: months(plan.plan_amc_duration_months) },
                  { label: "AMC Start Date", value: formatDetailDate(plan.plan_amc_start_date) },
                ]}
              />
            }
          >
            <DetailSection
              title="Plan Details"
              fields={[
                { label: "Plan Name", value: plan.plan_name },
                { label: "Plan Code", value: plan.plan_code },
                { label: "Module ID", value: plan.module_id },
                { label: "Plan Type", value: <span className="capitalize">{plan.plan_type}</span> },
                { label: "Quantity", value: plan.plan_quantity ?? "-" },
                { label: "Duration", value: months(plan.plan_duration_months) },
                { label: "Status", value: <span className="capitalize">{plan.plan_status}</span> },
              ]}
            />
          </DetailColumns>
        </>
      )}
    </DetailPage>
  )
}
