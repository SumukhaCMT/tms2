import { useState } from "react"

import type { FormErrors, WitnessDetailsForm } from "./hundiFormTypes"
import { collectZodErrors, emptyWitnessDetails, witnessDetailsSchema } from "./hundiFormLogic"
import type { WitnessSuggestion } from "./WitnessNameField"

export interface WitnessApi {
  witness_full_name: string
  witness_designation: string | null
  witness_email: string | null
  witness_phone: string | null
  witness_address_line1: string | null
  witness_address_line2: string | null
  witness_city: string | null
  witness_remarks: string | null
}

export function toWitnessPayload(witness: WitnessDetailsForm): WitnessApi {
  return {
    witness_full_name: witness.witnessFullName.trim(),
    witness_designation: witness.witnessDesignation.trim() || null,
    witness_email: witness.witnessEmail.trim() || null,
    witness_phone: witness.witnessPhone.trim() || null,
    witness_address_line1: witness.witnessAddressLine1.trim() || null,
    witness_address_line2: witness.witnessAddressLine2.trim() || null,
    witness_city: witness.witnessCity.trim() || null,
    witness_remarks: witness.witnessRemarks.trim() || null,
  }
}

export function fromWitnessApi(witness: WitnessApi): WitnessDetailsForm {
  return {
    witnessFullName: witness.witness_full_name ?? "",
    witnessDesignation: witness.witness_designation ?? "",
    witnessEmail: witness.witness_email ?? "",
    witnessPhone: witness.witness_phone ?? "",
    witnessAddressLine1: witness.witness_address_line1 ?? "",
    witnessAddressLine2: witness.witness_address_line2 ?? "",
    witnessCity: witness.witness_city ?? "",
    witnessRemarks: witness.witness_remarks ?? "",
  }
}

export function useWitnessList() {
  const [witnesses, setWitnesses] = useState<WitnessDetailsForm[]>(() => [emptyWitnessDetails()])
  const [errors, setErrors] = useState<FormErrors>({})

  function clearError(key: string) {
    setErrors((prev) => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function update<K extends keyof WitnessDetailsForm>(index: number, field: K, value: WitnessDetailsForm[K]) {
    setWitnesses((prev) => prev.map((witness, i) => (i === index ? { ...witness, [field]: value } : witness)))
    clearError(`${index}.${field}`)
  }

  function select(index: number, suggestion: WitnessSuggestion) {
    setWitnesses((prev) =>
      prev.map((witness, i) =>
        i === index
          ? {
              witnessFullName: suggestion.name,
              witnessDesignation: suggestion.designation ?? "",
              witnessPhone: suggestion.phone ?? "",
              witnessEmail: suggestion.email ?? "",
              witnessAddressLine1: suggestion.address_line1 ?? "",
              witnessAddressLine2: suggestion.address_line2 ?? "",
              witnessCity: suggestion.city ?? "",
              witnessRemarks: suggestion.remarks ?? "",
            }
          : witness,
      ),
    )
    setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith(`${index}.`))))
  }

  function add() {
    setWitnesses((prev) => [...prev, emptyWitnessDetails()])
  }

  function remove(index: number) {
    setWitnesses((prev) => prev.filter((_, i) => i !== index))
    setErrors({})
  }

  function validate(): boolean {
    const next: FormErrors = {}
    const seen = new Set<string>()
    witnesses.forEach((witness, index) => {
      const fieldErrors = collectZodErrors(witnessDetailsSchema.safeParse(witness))
      for (const key of Object.keys(fieldErrors)) next[`${index}.${key}`] = fieldErrors[key]
      const nameKey = witness.witnessFullName.trim().toLowerCase()
      if (nameKey && seen.has(nameKey)) next[`${index}.witnessFullName`] = "This witness is already added"
      seen.add(nameKey)
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  return { witnesses, setWitnesses, errors, update, select, add, remove, validate }
}

export type WitnessList = ReturnType<typeof useWitnessList>
