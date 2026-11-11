import { useState, type ReactNode } from "react"
import { ChevronsUpDown, X, CalendarIcon } from "lucide-react"
import { cn } from "cn"

import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { TimePicker } from "@/components/ui/time-picker"

import { toDateInputValue, parseDateInputValue, startOfToday } from "@/features/donations/shared/donationFormLogic"

import type { DeityOption } from "./hundiFormTypes"

export interface DeityMultiSelectFieldProps {
  value: string[]
  onChange: (value: string[]) => void
  deities: DeityOption[]
  error?: string
  disabled?: boolean
  notice?: ReactNode
}

export function DeityMultiSelectField({
  value,
  onChange,
  deities,
  error,
  disabled,
  notice,
}: DeityMultiSelectFieldProps) {
  const [open, setOpen] = useState(false)

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((existing) => existing !== id))
      return
    }
    onChange([...value, id])
  }

  const selectedNames = deities
    .filter((deity) => value.includes(String(deity.id)))
    .map((deity) => deity.name)

  return (
    <Field data-invalid={!!error}>
      <FieldLabel>
        Deities
        <span className="text-destructive"> *</span>
      </FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              aria-invalid={!!error}
              disabled={disabled}
              className="w-full justify-between font-normal"
            >
              <span className={cn("truncate text-left", selectedNames.length === 0 && "text-muted-foreground")}>
                {selectedNames.length ? selectedNames.join(", ") : disabled ? "Select a temple first" : "Select deities"}
              </span>
              <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
            </Button>
          }
        />
        <PopoverContent align="start" className="w-64 p-1">
          {deities.length === 0 && (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">No deities found for this temple</p>
          )}
          {deities.map((deity) => {
            const id = String(deity.id)
            const checked = value.includes(id)
            return (
              <button
                key={deity.id}
                type="button"
                onClick={() => toggle(id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                <Checkbox checked={checked} onCheckedChange={() => toggle(id)} />
                {deity.name}
              </button>
            )
          })}
        </PopoverContent>
      </Popover>
      {selectedNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {deities
            .filter((deity) => value.includes(String(deity.id)))
            .map((deity) => (
              <Badge key={deity.id} variant="secondary">
                {deity.name}
                <button
                  type="button"
                  onClick={() => toggle(String(deity.id))}
                  className="ml-1 rounded-full hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
        </div>
      )}
      {error && <FieldError>{error}</FieldError>}
      {notice}
    </Field>
  )
}

export interface DateTimeFieldProps {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  disabled?: boolean
}

function splitDateTimeValue(value: string): { datePart: string; timePart: string } {
  const [datePart, timePart] = value.split("T")
  return { datePart: datePart ?? "", timePart: timePart ?? "" }
}

export function DateTimeField({ name, label, value, onChange, error, required, disabled }: DateTimeFieldProps) {
  const { datePart, timePart } = splitDateTimeValue(value)
  const selectedDate = parseDateInputValue(datePart)
  const today = startOfToday()
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Date>(() => selectedDate ?? today)
  const [trackedValue, setTrackedValue] = useState(value)
  if (value !== trackedValue) {
    setTrackedValue(value)
    if (selectedDate) setMonth(selectedDate)
  }

  function currentTime(): string {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  }

  const todayValue = toDateInputValue(today)
  const maxTime = datePart === todayValue ? currentTime() : undefined

  function pick(date: Date) {
    const nextDate = toDateInputValue(date)
    const nextTime = timePart || currentTime()
    onChange(`${nextDate}T${nextDate === todayValue && nextTime > currentTime() ? currentTime() : nextTime}`)
    setMonth(date)
    setOpen(false)
  }

  function updateTime(nextTime: string) {
    onChange(`${datePart || todayValue}T${nextTime}`)
  }

  return (
    <Field data-invalid={!!error} className="min-w-0">
      <FieldLabel htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </FieldLabel>
      <div className="flex min-w-0 gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                id={name}
                aria-invalid={!!error}
                disabled={disabled}
                className="min-w-0 flex-1 justify-start font-normal"
              >
                <CalendarIcon className="size-4" />
                {selectedDate
                  ? selectedDate.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                  : "Pick a date"}
              </Button>
            }
          />
          <PopoverContent align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              month={month}
              onMonthChange={setMonth}
              disabled={(date) => date > today}
              onSelect={(date) => date && pick(date)}
            />
          </PopoverContent>
        </Popover>
        <TimePicker
          ariaLabel={`${label} time`}
          value={timePart}
          maxTime={datePart ? maxTime : currentTime()}
          disabled={disabled}
          invalid={!!error}
          onChange={updateTime}
          className="w-28 shrink-0"
        />
      </div>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}
