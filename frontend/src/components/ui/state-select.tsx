import { cn } from "cn"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { INDIA_STATE_OPTIONS } from "@/features/donations/shared/donationFormTypes"
import { normalizeIndiaState } from "@/features/donations/shared/donationFormLogic"

interface StateSelectProps {
  id?: string
  value: string | null | undefined
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  invalid?: boolean
  className?: string
}

export function StateSelect({ id, value, onChange, onBlur, disabled, invalid, className }: StateSelectProps) {
  const current = normalizeIndiaState(value ?? "")

  return (
    <Select value={current || null} onValueChange={(next) => onChange(String(next ?? ""))} disabled={disabled}>
      <SelectTrigger id={id} aria-invalid={invalid} onBlur={onBlur} className={cn("w-full", className)}>
        <SelectValue placeholder="Select state">{(selected: string | null) => selected || "Select state"}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {INDIA_STATE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

interface StateFieldProps extends StateSelectProps {
  label?: string
  required?: boolean
  error?: string
}

export function StateField({ id, label = "State", required, error, ...props }: StateFieldProps) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </FieldLabel>
      <StateSelect id={id} invalid={!!error} {...props} />
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}
