import type { ReactNode } from "react"
import { cn } from "cn"

import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export interface RecordCardItem {
  label: ReactNode
  value: ReactNode
  hidden?: boolean
  stacked?: boolean
}

interface RecordCardProps {
  index?: number
  title: ReactNode
  subtitle?: ReactNode
  badge?: ReactNode
  stats?: RecordCardItem[]
  fields?: RecordCardItem[]
  actions?: ReactNode
  className?: string
  children?: ReactNode
}

const visible = (items?: RecordCardItem[]) => (items ?? []).filter((item) => !item.hidden)

export function RecordCardGrid({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}>{children}</div>
}

export function RecordCard({ index, title, subtitle, badge, stats, fields, actions, className, children }: RecordCardProps) {
  const statItems = visible(stats)
  const fieldItems = visible(fields)

  return (
    <Card className={cn("gap-4 transition-shadow hover:shadow-md hover:ring-foreground/20", className)}>
      <CardHeader>
        {index !== undefined && <span className="text-xs font-medium tabular-nums text-muted-foreground">#{index}</span>}
        <CardTitle className="truncate font-semibold">{title}</CardTitle>
        {subtitle && <CardDescription className="truncate">{subtitle}</CardDescription>}
        {badge && <CardAction>{badge}</CardAction>}
      </CardHeader>

      {(statItems.length > 0 || fieldItems.length > 0 || children) && (
        <CardContent className="flex flex-1 flex-col gap-4">
          {statItems.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {statItems.map((item, i) => (
                <div key={i} className="min-w-0 rounded-lg bg-muted/60 px-3 py-2.5 even:text-right">
                  <p className="truncate text-xs text-muted-foreground">{item.label}</p>
                  <p className="mt-0.5 truncate text-base font-semibold tabular-nums capitalize">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {fieldItems.length > 0 && (
            <dl className="divide-y text-sm">
              {fieldItems.map((item, i) => (
                <div key={i} className={cn("flex gap-4 py-2 first:pt-0 last:pb-0", item.stacked ? "flex-col gap-1" : "items-center justify-between")}>
                  <dt className="shrink-0 text-muted-foreground">{item.label}</dt>
                  <dd className={cn("min-w-0 font-medium", item.stacked ? "line-clamp-2" : "truncate text-right")}>{item.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {children}
        </CardContent>
      )}

      {actions && <CardFooter className="justify-end gap-1 py-2">{actions}</CardFooter>}
    </Card>
  )
}
