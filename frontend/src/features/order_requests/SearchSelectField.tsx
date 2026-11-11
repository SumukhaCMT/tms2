import { useState } from "react"
import { ChevronsUpDown, Search } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

interface SearchSelectFieldProps {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  error?: string
  required?: boolean
  placeholder?: string
}

export function SearchSelectField({
  name,
  label,
  value,
  onChange,
  options,
  error,
  required,
  placeholder = "Select",
}: SearchSelectFieldProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const selected = options.find((option) => option.value === value)
  const query = search.trim().toLowerCase()
  const filtered = query ? options.filter((option) => option.label.toLowerCase().includes(query)) : options

  function pick(next: string) {
    onChange(next)
    setSearch("")
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
              role="combobox"
              aria-expanded={open}
              aria-invalid={!!error}
              className="w-full justify-between font-normal"
            >
              <span className={cn("truncate", !selected && "text-muted-foreground")}>
                {selected?.label ?? placeholder}
              </span>
              <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
            </Button>
          }
        />
        <PopoverContent className="w-(--anchor-width) min-w-64 p-0">
          <div className="flex items-center border-b px-3">
            <Search className="size-4 shrink-0 opacity-50" />
            <Input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              className="border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-muted-foreground">No results found</p>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => pick(option.value)}
                  className={cn(
                    "w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                    option.value === value && "bg-accent font-medium"
                  )}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}
