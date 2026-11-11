import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { parseDateInputValue, toDateInputValue } from "@/features/donations/shared/donationFormLogic"

export interface DatePickerProps {
  id?: string
  value: string
  onChange: (value: string) => void
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  invalid?: boolean
  className?: string
}

export function DatePicker({ id, value, onChange, minDate, maxDate, disabled, invalid, className }: DatePickerProps) {
  const selected = parseDateInputValue(value)
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Date>(() => selected ?? minDate ?? new Date())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            id={id}
            aria-invalid={invalid}
            disabled={disabled}
            className={cn("min-w-0 justify-start font-normal", !selected && "text-muted-foreground", className)}
          >
            <CalendarIcon className="size-4" />
            {selected ? selected.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Pick a date"}
          </Button>
        }
      />
      <PopoverContent align="start">
        <Calendar
          mode="single"
          selected={selected}
          month={month}
          onMonthChange={setMonth}
          disabled={(date) => (!!minDate && date < minDate) || (!!maxDate && date > maxDate)}
          onSelect={(date) => {
            if (!date) return
            onChange(toDateInputValue(date))
            setMonth(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
