import { useState } from "react"
import { ChevronsUpDown, ImagePlus, X, CalendarIcon, Clock } from "lucide-react"
import { cn } from "cn"

import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

import { toDateInputValue, parseDateInputValue, startOfToday } from "@/features/donations/shared/donationFormLogic"

import type { DeityOption } from "./hundiFormTypes"

export interface DeityMultiSelectFieldProps {
  value: string[]
  onChange: (value: string[]) => void
  deities: DeityOption[]
  error?: string
  disabled?: boolean
}

export function DeityMultiSelectField({
  value,
  onChange,
  deities,
  error,
  disabled,
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
    </Field>
  )
}

export interface ImageFieldProps {
  value: File | null
  onChange: (file: File | null) => void
  error?: string
}

export function ImageField({ onChange, error }: ImageFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  function handleFile(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(file ? URL.createObjectURL(file) : null)
    onChange(file)
  }

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="hundiImage">Hundi Image</FieldLabel>
      {previewUrl ? (
        <div className="relative w-fit">
          <img src={previewUrl} alt="Hundi" className="h-40 w-40 rounded-lg border object-cover" />
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            className="absolute -right-2 -top-2 rounded-full"
            onClick={() => handleFile(null)}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <label
          htmlFor="hundiImage"
          className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground hover:bg-muted/50"
        >
          <ImagePlus className="size-6" />
          <span className="text-xs">Upload photo</span>
        </label>
      )}
      <input
        id="hundiImage"
        name="hundiImage"
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
      />
      <p className="text-xs text-muted-foreground">Optional. JPEG or PNG, up to 5MB.</p>
      {error && <FieldError>{error}</FieldError>}
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

  function pick(date: Date) {
    onChange(`${toDateInputValue(date)}T${timePart || currentTime()}`)
    setMonth(date)
    setOpen(false)
  }

  function updateTime(nextTime: string) {
    onChange(`${datePart || toDateInputValue(today)}T${nextTime}`)
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
        <div className="relative w-32 shrink-0">
          <Clock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="time"
            aria-label={`${label} time`}
            value={timePart}
            disabled={disabled}
            onChange={(event) => updateTime(event.target.value)}
            onClick={(event) => event.currentTarget.showPicker?.()}
            className="cursor-pointer appearance-none bg-background pl-8 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
      </div>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}
