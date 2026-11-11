import { cn } from "cn"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const STATUS_STYLES: Record<string, string> = {
  active: "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400",
  inactive: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400",
  suspended: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400",
  pending: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400",
  resolved: "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400",
}

const FALLBACK = "border-border bg-muted text-muted-foreground"

const label = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

export function statusStyle(status?: string | null) {
  return STATUS_STYLES[String(status ?? "").toLowerCase()] ?? FALLBACK
}

export function StatusTag({ status, className }: { status?: string | null; className?: string }) {
  return (
    <span className={cn("inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium whitespace-nowrap", statusStyle(status), className)}>
      {status ? label(status) : "-"}
    </span>
  )
}

interface StatusSelectProps {
  value: string
  options?: readonly string[]
  onChange?: (status: string) => void
  disabled?: boolean
  className?: string
}

export function StatusSelect({ value, options = ["active", "inactive"], onChange, disabled, className }: StatusSelectProps) {
  if (!onChange) return <StatusTag status={value} className={className} />

  return (
    <Select value={value} onValueChange={(next) => next !== value && onChange(String(next))} disabled={disabled}>
      <SelectTrigger className={cn("h-8 rounded-md px-3 text-sm font-medium [&_svg]:text-current", statusStyle(value), className)}>
        <SelectValue>{(current: string) => label(current)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {label(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
