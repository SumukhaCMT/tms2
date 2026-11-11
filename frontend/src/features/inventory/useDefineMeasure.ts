import { useEffect, useState } from "react"

import api from "@/axios/axios"
import { clearMeasurementUnits, getMeasurementUnits } from "./shared/measurementUnitsCache"
import { showCmtToast } from "@/components/ui/cmt-toast"

import type { FormErrors, MeasurementUnitOption } from "./shared/inventoryFormTypes"
import { apiErrorMessage, collectZodErrors } from "./shared/inventoryFormLogic"
import {
  conversionRowSchema,
  emptyConversionRow,
  emptyDefineMeasureForm,
  type ConversionRow,
  type DefineMeasureForm,
} from "./defineMeasureTypes"

const nameKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ")

export function useDefineMeasure(open: boolean, module: "inventory" | "hundi" = "inventory") {
  const [form, setForm] = useState<DefineMeasureForm>(emptyDefineMeasureForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [units, setUnits] = useState<MeasurementUnitOption[]>([])
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!open) return
    let active = true
    getMeasurementUnits().then((data) => active && setUnits(data))
    return () => {
      active = false
    }
  }, [open, reloadKey])

  const measurements = [...new Set(units.map((unit) => unit.measurement_id))].map((id) => {
    const group = units.filter((unit) => unit.measurement_id === id)
    return {
      id,
      baseUnit: group.find((unit) => unit.is_base)?.unit_name ?? "",
      units: group.filter((unit) => !unit.is_base),
    }
  })

  function clearError(field: string) {
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function updateConversion<K extends keyof ConversionRow>(index: number, field: K, value: ConversionRow[K]) {
    setForm((prev) => ({
      ...prev,
      conversions: prev.conversions.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }))
    clearError(`conversions.${index}.${field}`)
  }

  function addConversion() {
    setForm((prev) => ({ ...prev, conversions: [...prev.conversions, emptyConversionRow()] }))
  }

  function removeConversion(index: number) {
    setForm((prev) => ({ ...prev, conversions: prev.conversions.filter((_, i) => i !== index) }))
    setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith("conversions."))))
  }

  function reset() {
    setForm(emptyDefineMeasureForm())
    setErrors({})
  }

  function validate(): boolean {
    const fieldErrors: FormErrors = {}
    const known = new Set(units.map((unit) => nameKey(unit.unit_name)))

    form.conversions.forEach((row, index) => {
      const rowErrors = collectZodErrors(conversionRowSchema.safeParse(row))
      for (const key of Object.keys(rowErrors)) {
        fieldErrors[`conversions.${index}.${key}`] = rowErrors[key]
      }
      if (Object.keys(rowErrors).length) return
      const from = nameKey(row.fromUnit)
      const to = nameKey(row.toUnit)
      if (from === to) fieldErrors[`conversions.${index}.toUnit`] = "Must differ from the first unit"
      else if (known.has(from) && known.has(to)) fieldErrors[`conversions.${index}.fromUnit`] = "Both units are already defined"
      known.add(from)
      known.add(to)
    })

    setErrors(fieldErrors)
    return Object.keys(fieldErrors).length === 0
  }

  function handleSubmit(onSaved: () => void) {
    if (!validate()) return
    setSaving(true)
    api
      .post(`/v1/${module}/measurements`, {
        conversions: form.conversions.map((row) => ({
          from_quantity: Number(row.fromQuantity),
          from_unit: row.fromUnit.trim(),
          to_quantity: Number(row.toQuantity),
          to_unit: row.toUnit.trim(),
        })),
      })
      .then(() => {
        showCmtToast("success", "Measurement defined successfully.")
        reset()
        clearMeasurementUnits()
        setReloadKey((prev) => prev + 1)
        onSaved()
      })
      .catch((error) => showCmtToast("expiry", apiErrorMessage(error, "Failed to define the measurement. Please try again.")))
      .finally(() => setSaving(false))
  }

  return {
    form,
    errors,
    saving,
    measurements,
    updateConversion,
    addConversion,
    removeConversion,
    reset,
    handleSubmit,
  }
}
