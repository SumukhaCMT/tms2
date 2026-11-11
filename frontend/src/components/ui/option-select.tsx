import { cn } from "cn"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface OptionSelectProps {
  id?: string
  value: string | null | undefined
  options: readonly string[]
  placeholder?: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  invalid?: boolean
  className?: string
}

export function OptionSelect({ id, value, options, placeholder = "Select", onChange, onBlur, disabled, invalid, className }: OptionSelectProps) {
  return (
    <Select value={value || null} onValueChange={(next) => onChange(String(next ?? ""))} disabled={disabled}>
      <SelectTrigger id={id} aria-invalid={invalid} onBlur={onBlur} className={cn("w-full cursor-pointer", className)}>
        <SelectValue placeholder={placeholder}>{(selected: string | null) => selected || placeholder}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
