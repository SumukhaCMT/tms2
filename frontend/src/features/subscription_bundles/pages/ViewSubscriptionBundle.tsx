import { useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { CalendarClock, IndianRupee, Layers, Pencil, Percent } from "lucide-react"

import type { AppDispatch } from "@/app/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatusTag } from "@/components/ui/status-select"
import { TableBody, TableCell, TableFooter, TableRow } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"
import { DetailColumns, DetailMessage, DetailPage, DetailSection, DetailStats, formatDetailDate } from "@/components/ui/detail-page"

import { fetchSubscriptionBundleById } from "../subscriptionBundleThunks"
import { selectSelectedSubscriptionBundle, selectSubscriptionBundleLoading } from "../subscriptionBundleSelectors"

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })
const formatCurrency = (value: number | null) => currency.format(Number(value || 0))
const formatMonths = (value: number | null, fallback = "-") => (value ? `${Number(value)} Months` : fallback)

export default function ViewSubscriptionBundle() {
  const { id } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const selected = useSelector(selectSelectedSubscriptionBundle)
  const loading = useSelector(selectSubscriptionBundleLoading)
  const bundle = selected && String(selected.id) === id ? selected : null
  const plans = bundle?.plans ?? []
  const plansTotal = plans.reduce((sum, plan) => sum + Number(plan.plan_total_price || 0), 0)
  const isPerpetual = bundle?.bundle_type === "perpetual"

  useEffect(() => {
    if (id) dispatch(fetchSubscriptionBundleById(Number(id)))
  }, [dispatch, id])

  return (
    <DetailPage
      title={bundle?.bundle_name ?? "Subscription Bundle"}
      description={bundle?.bundle_code ?? "Bundle details"}
      badges={
        bundle && (
          <>
            <Badge variant="secondary" className="capitalize">{bundle.bundle_type}</Badge>
            <StatusTag status={bundle.bundle_status} />
          </>
        )
      }
      actions={
        bundle && (
          <Button render={<Link to={`/subscription_bundles/edit/${bundle.id}`} />}>
            <Pencil /> Edit
          </Button>
        )
      }
      isLoading={loading && !bundle}
      empty={!bundle && "Subscription bundle not found."}
    >
      {bundle && (
        <>
          <DetailStats
            items={[
              { label: "Bundle Price", value: formatCurrency(bundle.bundle_price), icon: IndianRupee },
              { label: "GST", value: `${Number(bundle.bundle_gst_percentage)}%`, icon: Percent },
              { label: "Total Price", value: formatCurrency(bundle.bundle_total_price), icon: IndianRupee },
              { label: "Plans", value: plans.length, icon: Layers },
              { label: "Duration", value: formatMonths(bundle.bundle_duration_months, "Lifetime"), icon: CalendarClock },
            ]}
          />

          <DetailColumns
            aside={
              <>
                {isPerpetual && (
                  <DetailSection
                    title="AMC"
                    description="Annual maintenance charges"
                    fields={[
                      { label: "AMC Price", value: formatCurrency(bundle.bundle_amc_price) },
                      { label: "AMC GST", value: `${Number(bundle.bundle_amc_gst_percentage ?? 0)}%` },
                      { label: "AMC Duration", value: formatMonths(bundle.bundle_amc_duration_months) },
                      { label: "AMC Start Date", value: formatDetailDate(bundle.bundle_amc_start_date) },
                    ]}
                  />
                )}
                <DetailSection
                  title="Record Information"
                  fields={[
                    { label: "Created At", value: formatDetailDate(bundle.created_at, true) },
                    { label: "Last Updated", value: formatDetailDate(bundle.updated_at, true) },
                  ]}
                />
              </>
            }
          >
            <DetailSection
              title="Basic Information"
              description="Bundle pricing and validity"
              fields={[
                { label: "Bundle Name", value: bundle.bundle_name },
                { label: "Bundle Code", value: bundle.bundle_code },
                { label: "Bundle Type", value: <span className="capitalize">{bundle.bundle_type}</span> },
                { label: "Duration", value: formatMonths(bundle.bundle_duration_months, "Lifetime") },
                { label: "Bundle Price", value: formatCurrency(bundle.bundle_price) },
                { label: "GST", value: `${Number(bundle.bundle_gst_percentage)}%` },
                { label: "Total Price", value: formatCurrency(bundle.bundle_total_price) },
                { label: "Status", value: <StatusTag status={bundle.bundle_status} /> },
              ]}
            />

            <DetailSection
              title="Included Subscription Plans"
              description="Plans bundled in this package"
              action={<Badge variant="outline">{plans.length} {plans.length === 1 ? "plan" : "plans"}</Badge>}
            >
              {plans.length === 0 ? (
                <DetailMessage>No plans assigned.</DetailMessage>
              ) : (
                <ResizableTable
                  columns={[
                    { id: "index", label: "#", size: 5 },
                    { id: "plan", label: "Plan", size: 14 },
                    { id: "module", label: "Module", size: 10 },
                    { id: "type", label: "Type", size: 9 },
                    { id: "duration", label: "Duration", size: 9 },
                    { id: "price", label: "Price", size: 9, className: "justify-end" },
                    { id: "gst", label: "GST", size: 6, className: "justify-end" },
                    { id: "total", label: "Total", size: 9, className: "justify-end" },
                    { id: "status", label: "Status", size: 9 },
                  ]}
                >
                  <TableBody>
                    {plans.map((plan, index) => (
                      <TableRow key={plan.id}>
                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                        <TableCell>
                          <Link to={`/subscriptionplans/view/${plan.id}`} className="font-medium hover:underline">{plan.plan_name}</Link>
                          <div className="text-xs text-muted-foreground">{plan.plan_code}</div>
                        </TableCell>
                        <TableCell>{plan.module_name ?? "-"}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize">{plan.plan_type}</Badge></TableCell>
                        <TableCell>{formatMonths(plan.plan_duration_months, plan.plan_type === "perpetual" ? "Lifetime" : "-")}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(plan.plan_price)}</TableCell>
                        <TableCell className="text-right tabular-nums">{Number(plan.plan_gst_percentage)}%</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(plan.plan_total_price)}</TableCell>
                        <TableCell><StatusTag status={plan.plan_status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={7}>Plans Total (individually)</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(plansTotal)}</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                </ResizableTable>
              )}
            </DetailSection>
          </DetailColumns>
        </>
      )}
    </DetailPage>
  )
}
