import { useRef, useState } from "react"

import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@/components/ui/autocomplete"
import api from "@/axios/axios"

import type { DonorSuggestion, TempleUserOption } from "./addDonationTypes"

const receiverSourceLabels = { user: "User", trustee: "Trustee", receiver: "Previous receiver" }

export interface ReceiverNameFieldProps {
  value: string
  onChange: (value: string) => void
  onSelectUser: (user: TempleUserOption) => void
  error?: string
}

export function ReceiverNameField({ value, onChange, onSelectUser, error }: ReceiverNameFieldProps) {
  const [suggestions, setSuggestions] = useState<TempleUserOption[]>([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(next: string) {
    onChange(next)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (next.trim().length < 1) {
      setSuggestions([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get("/v1/donations/temple-users", {
          params: { q: next.trim() },
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
      <FieldLabel htmlFor="receiverName">Receiver Name</FieldLabel>
      <input
        id="receiverName"
        name="receiverName"
        value={value}
        placeholder="Search a user or trustee, or type a name"
        aria-invalid={!!error}
        className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute top-full z-10 mt-1 w-full rounded-lg border bg-popover shadow-md">
          {suggestions.map((suggestion) => (
            <button
              key={`${suggestion.source}-${suggestion.user_name}`}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
              onMouseDown={(event) => {
                event.preventDefault()
                onSelectUser(suggestion)
                setOpen(false)
              }}
            >
              <div className="font-medium">{suggestion.user_name}</div>
              <div className="text-xs text-muted-foreground">
                {[receiverSourceLabels[suggestion.source], suggestion.designation, suggestion.user_phone].filter(Boolean).join(" · ")}
              </div>
            </button>
          ))}
        </div>
      )}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

export interface DonorNameFieldProps {
  value: string
  onChange: (value: string) => void
  onSelectDonor: (donor: DonorSuggestion) => void
  error?: string
}

export function DonorNameField({ value, onChange, onSelectDonor, error }: DonorNameFieldProps) {
  const [suggestions, setSuggestions] = useState<DonorSuggestion[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const suggestionValue = (donor: DonorSuggestion) => JSON.stringify([donor.donor_name, donor.donor_phone ?? ""])

  function handleChange(next: string) {
    onChange(next)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (next.trim().length < 2) {
      setSuggestions([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get("/v1/donations/donors/search", {
          params: { q: next.trim() },
        })
        const data = res?.data?.data
        if (Array.isArray(data)) {
          setSuggestions(data)
        }
      } catch {
        void 0
      }
    }, 300)
  }

  function handleValueChange(next: string, reason: string) {
    if (reason === "input-change") {
      handleChange(next)
      return
    }

    const selected = suggestions.find((suggestion) => suggestionValue(suggestion) === next)
    if (selected) onSelectDonor(selected)
  }

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor="donorName">
        Donor Name
        <span className="text-destructive"> *</span>
      </FieldLabel>
      <Autocomplete
        items={suggestions}
        value={value}
        mode="none"
        itemToStringValue={suggestionValue}
        onValueChange={(next, details) => handleValueChange(next, details.reason)}
      >
        <AutocompleteInput render={<Input id="donorName" name="donorName" placeholder="Enter donor's full name" aria-invalid={!!error} />} />
        <AutocompleteContent>
          <AutocompleteList>
            {(suggestion: DonorSuggestion) => (
              <AutocompleteItem key={suggestionValue(suggestion)} value={suggestion}>
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="font-medium">{suggestion.donor_name}</span>
                  <Badge variant="outline">{suggestion.source === "devotee" ? "Devotee" : "Previous donation"}</Badge>
                </span>
                <span className="text-xs text-muted-foreground">
                  {[suggestion.donor_phone, suggestion.donor_email, suggestion.donor_city, suggestion.donor_state]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}
