import { useState } from "react"
import { cn } from "cn"
import { CalendarIcon } from "lucide-react"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

import { toDateInputValue, parseDateInputValue, startOfToday } from "./donationFormLogic"

export interface TextFieldProps {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  placeholder?: string
  type?: string
  readOnly?: boolean
  disabled?: boolean
  maxLength?: number
  inputMode?: "text" | "numeric" | "email" | "tel"
  helperText?: string
  onBlur?: () => void
}

export function TextField({
  name,
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  type = "text",
  readOnly,
  disabled,
  maxLength,
  inputMode,
  helperText,
  onBlur,
}: TextFieldProps) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </FieldLabel>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        maxLength={maxLength}
        inputMode={inputMode}
        aria-invalid={!!error}
        className={cn(readOnly && "bg-muted text-muted-foreground")}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
      {error ? (
        <FieldError>{error}</FieldError>
      ) : (
        helperText && <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </Field>
  )
}

export interface TextareaFieldProps {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
}

export function TextareaField({ name, label, value, onChange, error, placeholder }: TextareaFieldProps) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Textarea
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        aria-invalid={!!error}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

export interface SelectFieldProps {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  error?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
}

export function SelectField({
  name,
  label,
  value,
  onChange,
  options,
  error,
  required,
  placeholder = "Select",
  disabled,
}: SelectFieldProps) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </FieldLabel>
      <Select
        value={value || undefined}
        onValueChange={(next) => onChange(String(next ?? ""))}
        disabled={disabled}
      >
        <SelectTrigger id={name} aria-invalid={!!error} className="w-full">
          <SelectValue placeholder={placeholder}>
            {(current: string) => options.find((option) => option.value === current)?.label ?? placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

export interface DateFieldProps {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
}

export function DateField({ name, label, value, onChange, error, required }: DateFieldProps) {
  const selectedDate = parseDateInputValue(value)
  const today = startOfToday()
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Date>(() => selectedDate ?? today)
  const [trackedValue, setTrackedValue] = useState(value)
  if (value !== trackedValue) {
    setTrackedValue(value)
    if (selectedDate) setMonth(selectedDate)
  }

  function pick(date: Date) {
    onChange(toDateInputValue(date))
    setMonth(date)
    setOpen(false)
  }

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              id={name}
              aria-invalid={!!error}
              className="w-full justify-start font-normal"
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
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

export function SummaryRow({ label, value }: { label: string; value?: string | number | null }) {
  const display = value === 0 ? "0" : value || "—"
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium wrap-break-word">{display}</span>
    </div>
  )
}

export { Card, CardHeader, CardContent }
