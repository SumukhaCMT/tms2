import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"

export interface CalendarProps {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  month: Date
  onMonthChange: (month: Date) => void
  disabled?: (date: Date) => boolean
  fixedWeeks?: boolean
  className?: string
}

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function buildMonthGrid(month: Date, fixedWeeks: boolean): Date[] {
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
  const startWeekday = firstOfMonth.getDay()

  const gridStart = new Date(firstOfMonth)
  gridStart.setDate(gridStart.getDate() - startWeekday)

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const neededCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7
  const totalCells = fixedWeeks ? 42 : neededCells

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(date.getDate() + index)
    return date
  })
}

function Calendar({
  mode = "single",
  selected,
  onSelect,
  month,
  onMonthChange,
  disabled,
  fixedWeeks = false,
  className,
}: CalendarProps) {
  const days = React.useMemo(() => buildMonthGrid(month, fixedWeeks), [month, fixedWeeks])
  const today = React.useMemo(() => new Date(), [])

  return (
    <div className={cn("w-fit select-none", className)}>
      <div className="flex items-center justify-between px-1 pb-3">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
        >
          <ChevronLeft className="size-4" />
        </Button>

        <span className="text-sm font-medium">
          {month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </span>

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="flex size-9 items-center justify-center">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date) => {
          const inCurrentMonth = date.getMonth() === month.getMonth()
          const isDisabled = disabled?.(date) ?? false
          const isSelected = selected ? isSameDay(date, selected) : false
          const isToday = isSameDay(date, today)

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                if (mode !== "single") return
                onSelect?.(isSelected ? undefined : date)
              }}
              className={cn(
                "flex size-9 items-center justify-center rounded-md text-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:text-muted-foreground/40 disabled:opacity-50 disabled:hover:bg-transparent",
                !inCurrentMonth && "text-muted-foreground/50",
                isToday && !isSelected && "font-semibold text-primary",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { Calendar }
