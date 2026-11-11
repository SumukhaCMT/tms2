import { useState } from "react"
import { CalendarClock, ChevronDown, ChevronUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { formatDate, formatPrice, type UpcomingPlan } from "../../pricingCart"

const isScheduled = (item: UpcomingPlan) => item.payment_status === "paid" || item.order_status === "confirmed"

export default function UpcomingPlans({ items }: { items: UpcomingPlan[] }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, 1)

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <CardDescription className="text-xs font-medium tracking-wider uppercase">Upcoming Plans</CardDescription>
        <CardTitle className="text-xl font-semibold">Purchased &amp; Requested</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center text-sm text-muted-foreground">
            <CalendarClock className="size-6" />
            No upcoming or requested plans.
          </div>
        ) : (
          <ul className="flex flex-col divide-y">
            {visible.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{item.item_name}</span>
                    <Badge variant={isScheduled(item) ? "default" : "secondary"}>
                      {isScheduled(item) ? "Scheduled" : "Awaiting verification"}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Starts {formatDate(item.start_date)} · {item.end_date ? `Ends ${formatDate(item.end_date)}` : "Lifetime"}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-semibold">{formatPrice(item.line_total)}</span>
                  <span className="text-xs text-muted-foreground">{item.order_number}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        {items.length > 1 && (
          <Button variant="link" size="sm" className="mt-3 self-start px-0" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Show less" : `See more (${items.length - 1})`}
            {expanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
