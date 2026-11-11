import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export interface DetailItem {
  label: string
  value: ReactNode
  full?: boolean
  hidden?: boolean
}

export interface DetailStat {
  label: string
  value: ReactNode
  icon: LucideIcon
  hint?: ReactNode
  hidden?: boolean
}

interface DetailPageProps {
  title: ReactNode
  description?: ReactNode
  badges?: ReactNode
  actions?: ReactNode
  isLoading?: boolean
  empty?: string | false
  children?: ReactNode
}

export function DetailPage({ title, description, badges, actions, isLoading, empty, children }: DetailPageProps) {
  return (
    <main className="w-full space-y-6">
      <div className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {(badges || actions) && (
          <div className="flex flex-wrap items-center gap-2">
            {badges}
            {actions}
          </div>
        )}
      </div>

      {isLoading ? <DetailSkeleton /> : empty ? <DetailEmpty message={empty} /> : children}
    </main>
  )
}

export function DetailStats({ items }: { items: DetailStat[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none">
      {items
        .filter((item) => !item.hidden)
        .map(({ label, value, icon: Icon, hint }) => (
          <Card key={label} size="sm">
            <CardHeader>
              <CardDescription className="flex items-center justify-between">
                {label}
                <Icon className="size-4" />
              </CardDescription>
              <CardTitle className="truncate text-xl font-semibold tabular-nums">{value}</CardTitle>
              {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
            </CardHeader>
          </Card>
        ))}
    </div>
  )
}

export function DetailColumns({ aside, children }: { aside?: ReactNode; children: ReactNode }) {
  if (!aside) return <div className="space-y-6">{children}</div>

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="min-w-0 space-y-6 lg:col-span-2">{children}</div>
      <div className="min-w-0 space-y-6">{aside}</div>
    </div>
  )
}

interface DetailSectionProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  fields?: DetailItem[]
  image?: { src: string; alt: string }
  className?: string
  contentClassName?: string
  children?: ReactNode
}

export function DetailSection({ title, description, action, fields, image, className, contentClassName, children }: DetailSectionProps) {
  return (
    <Card className={cn(image && "pt-0", className)}>
      {image && <img src={image.src} alt={image.alt} className="aspect-video w-full bg-muted object-contain" />}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      {(fields || children) && (
        <CardContent className={cn("@container space-y-4", contentClassName)}>
          {fields && <DetailGrid items={fields} />}
          {children}
        </CardContent>
      )}
    </Card>
  )
}

export function DetailGrid({ items, className }: { items: DetailItem[]; className?: string }) {
  return (
    <div className="@container">
      <dl className={cn("grid gap-x-6 gap-y-4 @md:grid-cols-2", className)}>
        {items
          .filter((item) => !item.hidden)
          .map((item) => (
            <DetailField key={item.label} label={item.label} value={item.value} className={item.full ? "@md:col-span-2" : undefined} />
          ))}
      </dl>
    </div>
  )
}

export function DetailField({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium break-words">{value === 0 ? 0 : value || "-"}</dd>
    </div>
  )
}

export function DetailText({ children, fallback = "Nothing added." }: { children?: ReactNode; fallback?: string }) {
  return <p className="text-sm whitespace-pre-line text-muted-foreground">{children || fallback}</p>
}

export function DetailMessage({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 lg:col-span-2" />
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}

function DetailEmpty({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-10 text-center text-sm text-muted-foreground">{message}</CardContent>
    </Card>
  )
}

export function formatDetailDate(value?: string | null, withTime = false) {
  if (!value) return "-"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  })
}
