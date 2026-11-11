import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, Label, Pie, PieChart, XAxis, YAxis } from "recharts"

import { cn } from "cn"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { getOrgDashboard, type OrgDashboardData, type OrgDashboardSlice } from "../services/dashboardService"

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 })
const count = new Intl.NumberFormat("en-IN")

const COLORS = ["var(--color-emerald-500)", "var(--color-sky-500)", "var(--color-amber-500)", "var(--color-teal-500)", "var(--color-indigo-500)"]

const PANEL = "border-t-4 shadow-lg ring-0"

const revenueConfig = {
  donations: { label: "Donations", color: "var(--color-emerald-500)" },
  bookings: { label: "Seva Bookings", color: "var(--color-sky-500)" },
  tokens: { label: "Tokens", color: "var(--color-amber-500)" },
  hundi: { label: "Hundi Deposits", color: "var(--color-teal-500)" },
} satisfies ChartConfig

const valueConfig = { value: { label: "Amount", color: "var(--color-blue-500)" } } satisfies ChartConfig

const title = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

const sliceConfig = (slices: OrgDashboardSlice[]) =>
  Object.fromEntries(slices.map((slice, i) => [slice.name, { label: title(slice.name), color: COLORS[i % COLORS.length] }])) satisfies ChartConfig

const monthLabel = (month: string) =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })

interface Metric {
  title: string
  tone: string
  value: string
  hint: string
}

export default function OrgAdminDashboard() {
  const [data, setData] = useState<OrgDashboardData | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    getOrgDashboard()
      .then(setData)
      .catch(() => setError("Unable to load dashboard analytics."))
  }, [])

  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-destructive">{error}</CardContent>
      </Card>
    )
  }

  if (!data) return <OrgDashboardSkeleton />

  const { summary: s, monthly, temples, bookingStatus, paymentMethods, topSevas } = data
  const revenue = s.donation_amount + s.booking_amount + s.token_amount + s.hundi_amount

  const revenueShare = [
    { name: "donations", value: s.donation_amount },
    { name: "bookings", value: s.booking_amount },
    { name: "tokens", value: s.token_amount },
    { name: "hundi", value: s.hundi_amount },
  ].filter((slice) => slice.value > 0)

  const metrics: Metric[] = [
    { title: "Total Revenue", tone: "bg-linear-to-br from-emerald-500 to-emerald-700", value: currency.format(revenue), hint: "Donations, sevas, tokens and hundi" },
    { title: "Seva Bookings", tone: "bg-linear-to-br from-blue-500 to-blue-700", value: count.format(s.bookings), hint: `${currency.format(s.booking_amount)} revenue` },
    { title: "Upcoming Sevas", tone: "bg-linear-to-br from-sky-500 to-sky-700", value: count.format(s.upcoming_bookings), hint: `${count.format(s.today_bookings)} today · ${count.format(s.unpaid_bookings)} unpaid` },
    { title: "Hundi Counted", tone: "bg-linear-to-br from-teal-500 to-teal-700", value: currency.format(s.hundi_counted), hint: `${count.format(s.hundi_openings)} openings across ${count.format(s.hundis)} hundis` },
    { title: "Hundi Deposited", tone: "bg-linear-to-br from-cyan-500 to-cyan-700", value: currency.format(s.hundi_amount), hint: "Bank deposits" },
    { title: "Inventory Items", tone: "bg-linear-to-br from-indigo-500 to-indigo-700", value: count.format(s.inventory_items), hint: `${count.format(s.inventory_stock)} units in stock` },
    { title: "Out of Stock", tone: "bg-linear-to-br from-amber-500 to-yellow-600", value: count.format(s.out_of_stock), hint: "Items needing restock" },
    { title: "Active Subscriptions", tone: "bg-linear-to-br from-green-500 to-lime-600", value: count.format(s.subscriptions), hint: s.next_expiry ? `Next expiry ${new Date(s.next_expiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}` : "No upcoming expiry" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Org Admin Dashboard</h2>
        <p className="text-sm text-muted-foreground">Key metrics across all temples in your organization</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ title, tone, value, hint }) => (
          <Card key={title} size="sm" className={cn("text-white shadow-lg ring-0 transition-shadow hover:shadow-xl", tone)}>
            <CardHeader>
              <CardDescription className="font-medium text-white/85">{title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{value}</div>
              <p className="mt-1 text-xs text-white/80">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className={cn(PANEL, "border-t-emerald-500 lg:col-span-2")}>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Last 6 months by source</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="h-72 w-full">
              <BarChart data={monthly}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickFormatter={monthLabel} />
                <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={(value) => compact.format(value)} />
                <ChartTooltip content={<ChartTooltipContent labelFormatter={(label) => monthLabel(String(label))} />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="donations" stackId="revenue" fill="var(--color-donations)" />
                <Bar dataKey="bookings" stackId="revenue" fill="var(--color-bookings)" />
                <Bar dataKey="tokens" stackId="revenue" fill="var(--color-tokens)" />
                <Bar dataKey="hundi" stackId="revenue" fill="var(--color-hundi)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <DonutCard title="Revenue Share" description="All-time by source" data={revenueShare} config={revenueConfig} total={compact.format(revenue)} accent="border-t-sky-500" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <DonutCard title="Payment Methods" description="Donations, bookings and tokens" data={paymentMethods} config={sliceConfig(paymentMethods)} total={String(paymentMethods.length)} totalLabel="Methods" accent="border-t-teal-500" />
        <DonutCard title="Booking Status" description="All seva bookings" data={bookingStatus} config={sliceConfig(bookingStatus)} total={count.format(s.bookings)} totalLabel="Bookings" accent="border-t-blue-500" />

        <Card className={cn(PANEL, "border-t-amber-500")}>
          <CardHeader>
            <CardTitle>Top Sevas</CardTitle>
            <CardDescription>By revenue from bookings and tokens</CardDescription>
          </CardHeader>
          <CardContent>
            {topSevas.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartContainer config={valueConfig} className="h-60 w-full">
                <BarChart data={topSevas} layout="vertical" margin={{ left: 8 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={110} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value) => currency.format(Number(value))} />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className={cn(PANEL, "border-t-indigo-500")}>
        <CardHeader>
          <CardTitle>Temple-wise Performance</CardTitle>
          <CardDescription>Revenue split for each temple</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Temple</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Donations</TableHead>
                <TableHead className="text-right">Bookings</TableHead>
                <TableHead className="text-right">Tokens</TableHead>
                <TableHead className="text-right">Hundi</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {temples.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No temples yet.</TableCell>
                </TableRow>
              ) : (
                temples.map((temple) => (
                  <TableRow key={temple.id}>
                    <TableCell className="font-medium">{temple.temp_name}</TableCell>
                    <TableCell>{title(temple.temp_status)}</TableCell>
                    <TableCell className="text-right tabular-nums">{currency.format(temple.donation_amount)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {count.format(temple.bookings)}
                      <span className="block text-xs text-muted-foreground">{currency.format(temple.booking_amount)}</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {count.format(temple.tokens)}
                      <span className="block text-xs text-muted-foreground">{currency.format(temple.token_amount)}</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{currency.format(temple.hundi_amount)}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {currency.format(temple.donation_amount + temple.booking_amount + temple.token_amount + temple.hundi_amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

interface DonutCardProps {
  title: string
  description: string
  data: OrgDashboardSlice[]
  config: ChartConfig
  total: string
  totalLabel?: string
  accent: string
}

function DonutCard({ title, description, data, config, total, totalLabel = "Total", accent }: DonutCardProps) {
  return (
    <Card className={cn(PANEL, accent)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyChart />
        ) : (
          <ChartContainer config={config} className="mx-auto aspect-square h-60">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={4}>
                {data.map((slice) => (
                  <Cell key={slice.name} fill={`var(--color-${slice.name})`} />
                ))}
                <Label
                  content={({ viewBox }) =>
                    viewBox && "cx" in viewBox ? (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-bold">{total}</tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 20} className="fill-muted-foreground text-xs">{totalLabel}</tspan>
                      </text>
                    ) : null
                  }
                />
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} className="flex-wrap" />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyChart() {
  return <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">No data yet</div>
}

function OrgDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 lg:col-span-2" />
        <Skeleton className="h-80" />
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}
