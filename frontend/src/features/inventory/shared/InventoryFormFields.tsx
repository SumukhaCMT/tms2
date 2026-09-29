import { useRef, useState } from "react"

import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@/components/ui/autocomplete"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import api from "@/axios/axios"

import type { InventoryItemSuggestion, MeasurementUnitOption } from "./inventoryFormTypes"
import { formatQuantity } from "./inventoryFormLogic"

export interface GivenByFieldProps {
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
}

export function GivenByField({ value, onChange, error, required }: GivenByFieldProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
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
        const res = await api.get("/v1/inventory/given-by/search", { params: { q: next.trim() } })
        const data = res?.data?.data as { given_by: string }[] | undefined
        if (Array.isArray(data)) {
          const names = data.map((row) => row.given_by)
          setSuggestions(names)
          setOpen(names.length > 0)
        }
      } catch {
        void 0
      }
    }, 300)
  }

  return (
    <Field data-invalid={!!error} className="relative">
      <FieldLabel htmlFor="givenBy">
        Given By
        {required && <span className="text-destructive"> *</span>}
      </FieldLabel>
      <input
        id="givenBy"
        name="givenBy"
        value={value}
        placeholder="Search or type a name"
        aria-invalid={!!error}
        className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute top-full z-10 mt-1 w-full rounded-lg border bg-popover shadow-md">
          {suggestions.map((name, index) => (
            <button
              key={`${name}-${index}`}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
              onMouseDown={(event) => {
                event.preventDefault()
                onChange(name)
                setOpen(false)
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

export interface InventoryMeasurementUnitFieldProps {
  value: string
  onChange: (value: string) => void
  units: MeasurementUnitOption[]
  error?: string
  id?: string
  hideLabel?: boolean
  label?: string
  required?: boolean
  valueBy?: "id" | "name"
}

export function InventoryMeasurementUnitField({
  value,
  onChange,
  units,
  error,
  id = "inventoryUnit",
  hideLabel,
  label = "Stock Measurement",
  required = true,
  valueBy = "id",
}: InventoryMeasurementUnitFieldProps) {
  const optionValue = (unit: MeasurementUnitOption) => (valueBy === "name" ? unit.unit_name : String(unit.id))

  return (
    <Field data-invalid={!!error}>
      {!hideLabel && (
        <FieldLabel htmlFor={id}>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </FieldLabel>
      )}
      <Select value={value || null} onValueChange={(next) => onChange(String(next ?? ""))}>
        <SelectTrigger id={id} aria-invalid={!!error} className="w-full">
          <SelectValue placeholder="Select unit">
            {(current: string) => units.find((unit) => optionValue(unit) === current)?.unit_name ?? current ?? "Select unit"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {units.map((unit) => {
            const base = units.find((option) => option.measurement_id === unit.measurement_id && option.is_base)
            return (
              <SelectItem key={unit.id} value={optionValue(unit)}>
                {unit.unit_name}
                {!unit.is_base && base && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatQuantity(unit.conversion_factor)} {base.unit_name}
                  </span>
                )}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

export interface InventoryItemNameFieldProps {
  value: string
  onChange: (value: string) => void
  onSelect: (suggestion: InventoryItemSuggestion) => void
  error?: string
}

export function InventoryItemNameField({ value, onChange, onSelect, error }: InventoryItemNameFieldProps) {
  const [suggestions, setSuggestions] = useState<InventoryItemSuggestion[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function search(query: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setSuggestions([])
      return
    }
    debounceRef.current = setTimeout(() => {
      api
        .get("/v1/inventory/items/search", { params: { q: query.trim() } })
        .then((res) => setSuggestions(Array.isArray(res?.data?.data) ? res.data.data : []))
        .catch(() => setSuggestions([]))
    }, 300)
  }

  function handleValueChange(next: string, reason: string) {
    onChange(next)
    const match = reason !== "input-change" ? suggestions.find((suggestion) => suggestion.item_name === next) : undefined
    if (match) {
      onSelect(match)
      return
    }
    search(next)
  }

  return (
    <Field data-invalid={!!error}>
      <Autocomplete
        items={suggestions}
        value={value}
        mode="none"
        itemToStringValue={(suggestion: InventoryItemSuggestion) => suggestion.item_name}
        onValueChange={(next, details) => handleValueChange(next, details.reason)}
      >
        <AutocompleteInput render={<Input placeholder="e.g. Rice Bags" aria-invalid={!!error} />} />
        <AutocompleteContent>
          <AutocompleteList>
            {(suggestion: InventoryItemSuggestion) => (
              <AutocompleteItem key={suggestion.item_name} value={suggestion}>
                <span className="font-medium">{suggestion.item_name}</span>
                <span className="text-xs text-muted-foreground">
                  {suggestion.stock_quantity} {suggestion.unit_name ?? ""}
                  {suggestion.measurement ? ` × ${Number(suggestion.measurement)} units` : ""}
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
