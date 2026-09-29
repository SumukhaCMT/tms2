import { useEffect, useState } from "react"

import api from "@/axios/axios"

import type {
  FormErrors,
  InventoryBasicsForm,
  InventoryExtrasForm,
  InventoryItemRow,
  InventoryItemSuggestion,
  MeasurementUnitOption,
} from "./inventoryFormTypes"
import {
  collectZodErrors,
  emptyInventoryBasics,
  emptyInventoryExtras,
  emptyInventoryItemRow,
  inventoryBasicsSchema,
  inventoryItemRowSchema,
  unitTotals,
} from "./inventoryFormLogic"
import { normalizeAmount } from "./measurementMath"

export type InventoryWizardStep = 1 | 2 | 3

export function useInventoryWizard(extraBasicsErrors: () => FormErrors = () => ({})) {
  const [step, setStep] = useState<InventoryWizardStep>(1)
  const [basics, setBasics] = useState<InventoryBasicsForm>(emptyInventoryBasics)
  const [items, setItems] = useState<InventoryItemRow[]>(() => [emptyInventoryItemRow()])
  const [extras, setExtras] = useState<InventoryExtrasForm>(emptyInventoryExtras)
  const [errors, setErrors] = useState<FormErrors>({})
  const [itemTypes, setItemTypes] = useState<string[]>([])
  const [measurementUnits, setMeasurementUnits] = useState<MeasurementUnitOption[]>([])

  useEffect(() => {
    let active = true
    api
      .get("/v1/inventory/item-types")
      .then((res) => active && Array.isArray(res?.data?.data) && setItemTypes(res.data.data))
      .catch(() => undefined)
    api
      .get("/v1/inventory/measurements/units")
      .then((res) => active && Array.isArray(res?.data?.data) && setMeasurementUnits(res.data.data))
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  function clearError(field: string) {
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function updateBasics<K extends keyof InventoryBasicsForm>(field: K, value: InventoryBasicsForm[K]) {
    setBasics((prev) => ({ ...prev, [field]: value }))
    clearError(field)
  }

  function updateExtras<K extends keyof InventoryExtrasForm>(field: K, value: InventoryExtrasForm[K]) {
    setExtras((prev) => ({ ...prev, [field]: value }))
    clearError(field)
  }

  function updateItem<K extends keyof InventoryItemRow>(index: number, field: K, value: InventoryItemRow[K]) {
    setItems((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
    clearError(`items.${index}.${field}`)
  }

  function applyItemSuggestion(index: number, suggestion: InventoryItemSuggestion) {
    setItems((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              itemName: suggestion.item_name,
              stockQuantity: String(suggestion.stock_quantity),
              unitId: String(suggestion.unit_id),
              measurement: suggestion.measurement ? String(Number(suggestion.measurement)) : "",
            }
          : row,
      ),
    )
    setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith(`items.${index}.`))))
  }

  function normalizeItemMeasurement(index: number, patch: Partial<InventoryItemRow> = {}) {
    const row = { ...items[index], ...patch }
    const unit = measurementUnits.find((option) => String(option.id) === row.unitId)
    const result = normalizeAmount(row.measurement, unit, measurementUnits)
    if (!result) return
    setItems((prev) =>
      prev.map((current, i) => (i === index ? { ...current, measurement: result.value, unitId: String(result.unit.id) } : current)),
    )
  }

  function addItem() {
    setItems((prev) => [...prev, emptyInventoryItemRow()])
  }

  function removeItem(index: number) {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [emptyInventoryItemRow()]))
    setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith("items."))))
  }


  function unitName(unitId: string) {
    return measurementUnits.find((unit) => String(unit.id) === unitId)?.unit_name ?? ""
  }

  function validateBasics(): boolean {
    const fieldErrors = { ...extraBasicsErrors(), ...collectZodErrors(inventoryBasicsSchema.safeParse(basics)) }
    setErrors(fieldErrors)
    return Object.keys(fieldErrors).length === 0
  }

  function validateItems(): boolean {
    const fieldErrors: FormErrors = {}
    const seenNames = new Set<string>()
    items.forEach((row, index) => {
      const rowErrors = collectZodErrors(inventoryItemRowSchema.safeParse(row))
      for (const key of Object.keys(rowErrors)) {
        fieldErrors[`items.${index}.${key}`] = rowErrors[key]
      }
      const nameKey = row.itemName.trim().toLowerCase().replace(/\s+/g, " ")
      if (!nameKey) return
      if (seenNames.has(nameKey) && !fieldErrors[`items.${index}.itemName`]) {
        fieldErrors[`items.${index}.itemName`] = "Item already added"
      }
      seenNames.add(nameKey)
    })
    setErrors(fieldErrors)
    return Object.keys(fieldErrors).length === 0
  }

  function validateAll(): boolean {
    if (!validateBasics()) {
      setStep(1)
      return false
    }
    if (!validateItems()) {
      setStep(2)
      return false
    }
    return true
  }

  function handleNext() {
    if (step === 1 && validateBasics()) setStep(2)
    if (step === 2 && validateItems()) setStep(3)
  }

  function handleBack() {
    setStep((prev) => (prev > 1 ? ((prev - 1) as InventoryWizardStep) : prev))
  }

  return {
    step,
    setStep,
    basics,
    setBasics,
    items,
    setItems,
    extras,
    setExtras,
    errors,
    itemTypes,
    measurementUnits,
    totals: unitTotals(items, unitName),
    updateBasics,
    updateExtras,
    updateItem,
    applyItemSuggestion,
    addItem,
    removeItem,
    normalizeItemMeasurement,
    unitName,
    validateAll,
    handleNext,
    handleBack,
  }
}

export type InventoryWizard = ReturnType<typeof useInventoryWizard>
