import { useRef, useState } from "react"

import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import api from "@/axios/axios"

export interface WitnessSuggestion {
  name: string
  designation: string | null
  phone: string | null
  email: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  remarks: string | null
  source: "user" | "witness"
}

interface WitnessNameFieldProps {
  name?: string
  value: string
  onChange: (value: string) => void
  onSelect: (witness: WitnessSuggestion) => void
  exclude?: string[]
  error?: string
}

export function WitnessNameField({ name = "witnessFullName", value, onChange, onSelect, exclude = [], error }: WitnessNameFieldProps) {
  const [suggestions, setSuggestions] = useState<WitnessSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(next: string) {
    onChange(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!next.trim()) {
      setSuggestions([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      api
        .get("/v1/hundi/witnesses/search", { params: { q: next.trim() } })
        .then((res) => {
          const excluded = new Set(exclude.map((entry) => entry.trim().toLowerCase()))
          const data = (Array.isArray(res?.data?.data) ? (res.data.data as WitnessSuggestion[]) : []).filter(
            (suggestion) => !excluded.has(suggestion.name.trim().toLowerCase()),
          )
          setSuggestions(data)
          setOpen(data.length > 0)
        })
        .catch(() => undefined)
    }, 300)
  }

  return (
    <Field data-invalid={!!error} className="relative">
      <FieldLabel htmlFor={name}>
        Full Name <span className="text-destructive"> *</span>
      </FieldLabel>
      <Input
        id={name}
        name={name}
        value={value}
        autoComplete="off"
        placeholder="Search a user or type a name"
        aria-invalid={!!error}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <div className="absolute top-full z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border bg-popover shadow-md">
          {suggestions.map((suggestion) => (
            <button
              key={`${suggestion.source}-${suggestion.name}`}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
              onMouseDown={(event) => {
                event.preventDefault()
                onSelect(suggestion)
                setSuggestions([])
                setOpen(false)
              }}
            >
              <div className="font-medium">{suggestion.name}</div>
              <div className="text-xs text-muted-foreground">
                {[suggestion.source === "user" ? "User" : "Previous witness", suggestion.designation, suggestion.phone]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </button>
          ))}
        </div>
      )}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}
