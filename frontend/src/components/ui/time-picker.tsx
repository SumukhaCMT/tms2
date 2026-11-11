import { useState } from "react"
import { Clock } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))

interface TimeColumnProps {
  items: string[]
  selected: string
  isDisabled: (item: string) => boolean
  onSelect: (item: string) => void
}

function TimeColumn({ items, selected, isDisabled, onSelect }: TimeColumnProps) {
  return (
    <div className="flex max-h-64 flex-col gap-1 overflow-y-auto p-2 not-first:border-l">
      {items.map((item) => (
        <Button
          key={item}
          type="button"
          size="sm"
          variant={item === selected ? "default" : "ghost"}
          disabled={isDisabled(item)}
          ref={item === selected ? (el: HTMLButtonElement | null) => el?.scrollIntoView({ block: "center" }) : undefined}
          onClick={() => onSelect(item)}
          className="w-10 shrink-0 justify-center tabular-nums"
        >
          {item}
        </Button>
      ))}
    </div>
  )
}

export interface TimePickerProps {
  id?: string
  value: string
  onChange: (value: string) => void
  maxTime?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
  ariaLabel?: string
}

export function TimePicker({ id, value, onChange, maxTime, disabled, invalid, className, ariaLabel }: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const [hour = "", minute = ""] = value ? value.split(":") : []
  const [maxHour, maxMinute] = maxTime ? maxTime.split(":") : ["23", "59"]
  const activeHour = hour || "00"

  function selectHour(nextHour: string) {
    const nextMinute = minute || "00"
    onChange(`${nextHour}:${nextHour === maxHour && nextMinute > maxMinute ? maxMinute : nextMinute}`)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            id={id}
            aria-label={ariaLabel}
            aria-invalid={invalid}
            disabled={disabled}
            className={cn("justify-start font-normal tabular-nums", !value && "text-muted-foreground", className)}
          >
            <Clock className="size-4" />
            {value || "--:--"}
          </Button>
        }
      />
      <PopoverContent align="end" className="flex p-0">
        <TimeColumn items={HOURS} selected={hour} isDisabled={(item) => item > maxHour} onSelect={selectHour} />
        <TimeColumn
          items={MINUTES}
          selected={minute}
          isDisabled={(item) => activeHour >= maxHour && item > maxMinute}
          onSelect={(item) => onChange(`${activeHour}:${item}`)}
        />
      </PopoverContent>
    </Popover>
  )
}
