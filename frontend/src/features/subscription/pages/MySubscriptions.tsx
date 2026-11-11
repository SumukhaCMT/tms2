import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CalendarClock, CreditCard } from "lucide-react"
import { toast } from "sonner"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { fetchSubscriptionPlans } from "../subscriptionPlanThunks"
import { selectSubscriptionPlans } from "../subscriptionPlanSelectors"
import { fetchSubscriptionBundles } from "@/features/subscription_bundles/subscriptionBundleThunks"
import { selectSubscriptionBundles } from "@/features/subscription_bundles/subscriptionBundleSelectors"
import { formatDate, formatPrice, type ActiveSubscription, type UpcomingPlan } from "../pricingCart"
import { apiErrorMessage, getActiveSubscriptions, getUpcomingPlans } from "../services/cartService"

const DAY = 86400000

const cycleLabel = (months: number | null, perpetual: boolean) =>
  perpetual ? "Perpetual" : months === 12 ? "Annual" : months === 1 ? "1 Month" : `${months ?? 1} Months`

const istMidnight = (value: string) => new Date(`${value.slice(0, 10)}T00:00:00+05:30`).getTime()

const formatEndDate = (value: string) => formatDate(new Date(istMidnight(value) - DAY).toISOString())

const usageOf = (subscription: ActiveSubscription, now: number) => {
  if (!subscription.expiry_date) return null
  const start = istMidnight(subscription.start_date)
  const end = istMidnight(subscription.expiry_date)
  const total = Math.max(1, Math.round((end - start) / DAY))
  const left = Math.max(0, Math.ceil((end - now) / DAY))
  return { left, used: Math.min(100, Math.round(((total - left) / total) * 100)) }
}

const isScheduled = (item: UpcomingPlan) => item.payment_status === "paid" || item.order_status === "confirmed"

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
      <CalendarClock className="size-6" />
      {text}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  )
}

export default function MySubscriptions() {
  const dispatch = useAppDispatch()
  const plans = useAppSelector(selectSubscriptionPlans)
  const bundles = useAppSelector(selectSubscriptionBundles)
  const [active, setActive] = useState<ActiveSubscription[]>([])
  const [upcoming, setUpcoming] = useState<UpcomingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [now] = useState(Date.now)

  useEffect(() => {
    void dispatch(fetchSubscriptionPlans())
    void dispatch(fetchSubscriptionBundles())
    Promise.all([getActiveSubscriptions(), getUpcomingPlans()])
      .then(([activeRows, upcomingRows]) => {
        setActive(activeRows)
        setUpcoming(upcomingRows)
      })
      .catch((error: unknown) => toast.error(apiErrorMessage(error)))
      .finally(() => setLoading(false))
  }, [dispatch])

  const rows = useMemo(() => {
    const planById = new Map(plans.map((plan) => [Number(plan.id), plan]))
    const bundleById = new Map(bundles.map((bundle) => [Number(bundle.id), bundle]))
    return active.map((subscription) => {
      const plan = subscription.plan_id ? planById.get(Number(subscription.plan_id)) : undefined
      const bundle = subscription.bundle_id ? bundleById.get(Number(subscription.bundle_id)) : undefined
      const perpetual = subscription.license_type === "perpetual"
      const isBundle = subscription.subscription_type === "bundle"
      return {
        subscription,
        name: isBundle && bundle ? `${bundle.bundle_name}${plan ? ` · ${plan.plan_name}` : ""}` : plan?.plan_name ?? bundle?.bundle_name ?? "—",
        cycle: cycleLabel(Number((isBundle ? bundle?.bundle_duration_months : plan?.plan_duration_months) ?? 1), perpetual),
        usage: usageOf(subscription, now),
      }
    })
  }, [active, plans, bundles, now])

  const activeTotal = active.reduce((sum, subscription) => sum + Number(subscription.amount_paid ?? 0), 0)
  const upcomingTotal = upcoming.reduce((sum, item) => sum + Number(item.line_total ?? 0), 0)

  return (
    <div className="flex w-full flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">My Subscriptions</CardTitle>
          <CardDescription>Your active plans and the ones scheduled or awaiting verification.</CardDescription>
          <CardAction>
            <Button render={<Link to="/plans" />}>
              <CreditCard />
              Browse Plans
            </Button>
          </CardAction>
        </CardHeader>
      </Card>

      <Tabs defaultValue="active" className="gap-4">
        <TabsList>
          <TabsTrigger value="active" className="cursor-pointer px-4">
            Active ({active.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="cursor-pointer px-4">
            Upcoming ({upcoming.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardContent>
              {loading ? (
                <TableSkeleton />
              ) : rows.length === 0 ? (
                <EmptyState text="No active subscriptions." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sl.no</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Billing Cycle</TableHead>
                      <TableHead>Started On</TableHead>
                      <TableHead>Ends On</TableHead>
                      <TableHead className="w-56">Usage</TableHead>
                      <TableHead className="text-right">Amount Paid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, index) => (
                      <TableRow key={row.subscription.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="font-medium">{row.name}</div>
                          {row.subscription.amc_start_date && row.subscription.amc_end_date && (
                            <div className="text-xs text-muted-foreground">
                              AMC: {formatDate(row.subscription.amc_start_date)} – {formatEndDate(row.subscription.amc_end_date)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{row.cycle}</TableCell>
                        <TableCell>{formatDate(row.subscription.start_date)}</TableCell>
                        <TableCell>{row.subscription.expiry_date ? formatEndDate(row.subscription.expiry_date) : "Lifetime"}</TableCell>
                        <TableCell>
                          {row.usage ? (
                            <div className="flex flex-col gap-1.5">
                              <Progress value={row.usage.used} />
                              <span className="text-xs text-muted-foreground">
                                {`${row.usage.left} day${row.usage.left === 1 ? "" : "s"} remaining`}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Lifetime access</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatPrice(row.subscription.amount_paid)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={6}>Total Amount Paid</TableCell>
                      <TableCell className="text-right">{formatPrice(activeTotal)}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardContent>
              {loading ? (
                <TableSkeleton />
              ) : upcoming.length === 0 ? (
                <EmptyState text="No upcoming or requested plans." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sl.no</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Starts On</TableHead>
                      <TableHead>Ends On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcoming.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="font-medium">{item.item_name}</div>
                          {item.amc_start_date && item.amc_end_date && (
                            <div className="text-xs text-muted-foreground">
                              AMC: {formatDate(item.amc_start_date)} – {formatEndDate(item.amc_end_date)}
                            </div>
                          )}
                          {item.modules.length > 0 && (
                            <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                              {item.modules.map((module) => (
                                <li key={module.plan_name} className="flex flex-wrap items-center gap-x-1.5">
                                  <span className="text-foreground">{module.plan_name}</span>
                                  <span>
                                    {formatDate(module.start_date)} – {module.end_date ? formatEndDate(module.end_date) : "Lifetime"}
                                  </span>
                                  {module.start_date > item.start_date && (
                                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                      <CalendarClock className="size-3.5" />
                                      Starts after your current plan ends
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </TableCell>
                        <TableCell>{item.order_number}</TableCell>
                        <TableCell>{formatDate(item.start_date)}</TableCell>
                        <TableCell>{item.end_date ? formatEndDate(item.end_date) : "Lifetime"}</TableCell>
                        <TableCell>
                          <Badge variant={isScheduled(item) ? "default" : "secondary"}>
                            {isScheduled(item) ? "Scheduled" : "Awaiting verification"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatPrice(item.line_total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={6}>Total Amount</TableCell>
                      <TableCell className="text-right">{formatPrice(upcomingTotal)}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
