import { useEffect, useState } from "react"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"

import type { FormErrors, MeasurementUnitOption } from "./shared/inventoryFormTypes"
import { apiErrorMessage, collectZodErrors } from "./shared/inventoryFormLogic"
import {
  conversionRowSchema,
  defineMeasureSchema,
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
    api
      .get("/v1/inventory/measurements/units")
      .then((res) => active && Array.isArray(res?.data?.data) && setUnits(res.data.data))
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [open, reloadKey])

  const measurements = [...new Set(units.map((unit) => unit.measurement_name))].map((name) => {
    const group = units.filter((unit) => unit.measurement_name === name)
    return {
      name,
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

  function updateField(field: "measurementName" | "baseUnitName", value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    clearError(field)
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
    const fieldErrors: FormErrors = collectZodErrors(defineMeasureSchema.safeParse(form))
    const existingUnits = new Set(units.map((unit) => nameKey(unit.unit_name)))
    const existingMeasurements = new Set(units.map((unit) => nameKey(unit.measurement_name)))
    const seen = new Set<string>()

    if (!fieldErrors.measurementName && existingMeasurements.has(nameKey(form.measurementName))) {
      fieldErrors.measurementName = "Measurement already exists"
    }

    if (!fieldErrors.baseUnitName) {
      const key = nameKey(form.baseUnitName)
      if (existingUnits.has(key)) fieldErrors.baseUnitName = "Unit already defined"
      seen.add(key)
    }

    form.conversions.forEach((row, index) => {
      const rowErrors = collectZodErrors(conversionRowSchema.safeParse(row))
      for (const key of Object.keys(rowErrors)) {
        fieldErrors[`conversions.${index}.${key}`] = rowErrors[key]
      }
      const key = nameKey(row.unitName)
      if (!key || fieldErrors[`conversions.${index}.unitName`]) return
      if (seen.has(key)) fieldErrors[`conversions.${index}.unitName`] = "Unit already added"
      else if (existingUnits.has(key)) fieldErrors[`conversions.${index}.unitName`] = "Unit already defined"
      seen.add(key)
    })

    setErrors(fieldErrors)
    return Object.keys(fieldErrors).length === 0
  }

  function handleSubmit(onSaved: () => void) {
    if (!validate()) return
    setSaving(true)
    api
      .post(`/v1/${module}/measurements`, {
        measurement_name: form.measurementName.trim(),
        base_unit_name: form.baseUnitName.trim(),
        conversions: form.conversions.map((row) => ({
          unit_name: row.unitName.trim(),
          conversion_factor: Number(row.factor),
        })),
      })
      .then(() => {
        showCmtToast("success", "Measurement defined successfully.")
        reset()
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
    updateField,
    updateConversion,
    addConversion,
    removeConversion,
    reset,
    handleSubmit,
  }
}
