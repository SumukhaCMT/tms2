import { useRef, useState } from "react"
import { Loader2, CircleCheck, CircleAlert } from "lucide-react"

import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import api from "@/axios/axios"

import type { DepositedByOption } from "../hundiTrackingTypes"

export interface IfscFieldProps {
  value: string
  onChange: (value: string) => void
  onResolved: (bankName: string | null) => void
  error?: string
}

export function IfscField({ value, onChange, onResolved, error }: IfscFieldProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "valid" | "invalid">("idle")
  const requestRef = useRef(0)

  function handleChange(raw: string) {
    const next = raw.toUpperCase().replace(/[^A-Z0-9]/g, "")
    onChange(next)
    onResolved(null)

    const requestId = ++requestRef.current

    if (next.length !== 11) {
      setStatus("idle")
      return
    }

    setStatus("loading")

    api
      .get(`/v1/hundi-tracking/ifsc/${next}`)
      .then((res) => {
        if (requestRef.current !== requestId) return
        const bank = res?.data?.data?.bank
        if (bank) {
          setStatus("valid")
          onResolved(bank)
        } else {
          setStatus("invalid")
        }
      })
      .catch(() => {
        if (requestRef.current !== requestId) return
        setStatus("invalid")
      })
  }

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="ifscCode">
        Bank IFSC Code
        <span className="text-destructive"> *</span>
      </FieldLabel>
      <div className="relative">
        <Input
          id="ifscCode"
          value={value}
          placeholder="e.g. SBIN0001234"
          maxLength={11}
          aria-invalid={!!error}
          className="pr-8 uppercase"
          onChange={(event) => handleChange(event.target.value)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {status === "loading" && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          {status === "valid" && <CircleCheck className="size-4 text-emerald-600" />}
          {status === "invalid" && <CircleAlert className="size-4 text-destructive" />}
        </div>
      </div>
      {status === "invalid" && !error && <FieldError>IFSC code not found</FieldError>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

export interface DepositedByFieldProps {
  templeId: number | null
  value: string
  onChange: (value: string) => void
  onSelect: (option: DepositedByOption | null) => void
  error?: string
}

export function DepositedByField({ templeId, value, onChange, onSelect, error }: DepositedByFieldProps) {
  const [suggestions, setSuggestions] = useState<DepositedByOption[]>([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(next: string) {
    onChange(next)
    onSelect(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!templeId || next.trim().length < 1) {
      setSuggestions([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get("/v1/hundi-tracking/deposited-by/search", {
          params: { temple_id: templeId, q: next.trim() },
        })
        const data = res?.data?.data
        if (Array.isArray(data)) {
          setSuggestions(data)
          setOpen(data.length > 0)
        }
      } catch {
        void 0
      }
    }, 300)
  }

  return (
    <Field data-invalid={!!error} className="relative">
      <FieldLabel htmlFor="depositedBy">
        Deposited By
        <span className="text-destructive"> *</span>
      </FieldLabel>
      <Input
        id="depositedBy"
        value={value}
        placeholder={templeId ? "Search a temple user by name" : "Select a hundi first"}
        disabled={!templeId}
        aria-invalid={!!error}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute top-full z-10 mt-1 w-full rounded-lg border bg-popover shadow-md">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
              onMouseDown={(event) => {
                event.preventDefault()
                onChange(suggestion.name)
                onSelect(suggestion)
                setOpen(false)
              }}
            >
              <div className="font-medium">{suggestion.name}</div>
              {suggestion.phone && <div className="text-xs text-muted-foreground">{suggestion.phone}</div>}
            </button>
          ))}
        </div>
      )}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}
