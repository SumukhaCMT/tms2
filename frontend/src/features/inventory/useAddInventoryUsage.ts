import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { z } from "zod"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"

import type { MeasurementUnitOption } from "./shared/inventoryFormTypes"
import { buildLiveStock, normalizeAmount } from "./shared/measurementMath"
import {
  emptyInventoryUsageForm,
  type InventoryItemOptionApi,
  type InventoryStockSummaryApi,
  type InventoryUsageForm,
  type FormErrors,
} from "./inventoryUsageTypes"

function mapStockSummary(row: InventoryStockSummaryApi): InventoryStockSummaryApi {
  return {
    ...row,
    total_stock: Number(row.total_stock) || 0,
    total_used: Number(row.total_used) || 0,
    total_remaining: Number(row.total_remaining) || 0,
    total_stock_base: Number(row.total_stock_base) || 0,
    total_used_base: Number(row.total_used_base) || 0,
    total_remaining_base: Number(row.total_remaining_base) || 0,
  }
}

const usageSchema = z.object({
  itemId: z.string().trim().min(1, "Select an item"),
  usedQuantity: z
    .string()
    .trim()
    .min(1, "Enter the quantity used")
    .refine((value) => Number(value) > 0, "Enter a valid quantity"),
  usedUnit: z.string().trim().min(1, "Select a measurement unit"),
  usedMeasurement: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\d+(\.\d+)?$/.test(value), "Enter numbers only"),
  usedWhere: z.string().trim().min(1, "Enter where the item was used"),
  usedDate: z.string().trim().min(1, "Pick a date"),
  remarks: z.string().trim().optional(),
})

export function useAddInventoryUsage() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [items, setItems] = useState<InventoryItemOptionApi[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [stockSummary, setStockSummary] = useState<InventoryStockSummaryApi | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [measurementUnits, setMeasurementUnits] = useState<MeasurementUnitOption[]>([])
  const [form, setForm] = useState<InventoryUsageForm>(() => emptyInventoryUsageForm())
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function loadInitialItems() {
      setLoadingItems(true)
      try {
        const res = await api.get("/v1/inventory-used/items")
        const data = res?.data?.data
        if (!isCancelled && Array.isArray(data)) setItems(data)
      } catch (error) {
        console.error("GET INVENTORY ITEM OPTIONS ERROR:", error)
      } finally {
        if (!isCancelled) setLoadingItems(false)
      }
    }

    void loadInitialItems()

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    let isCancelled = false

    async function loadInitialUnits() {
      try {
        const res = await api.get("/v1/inventory/measurements/units")
        const data = res?.data?.data
        if (!isCancelled && Array.isArray(data)) setMeasurementUnits(data)
      } catch (error) {
        console.error("GET MEASUREMENT UNITS ERROR:", error)
      }
    }

    void loadInitialUnits()

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    let isCancelled = false

    async function loadSummary() {
      if (!form.itemId) {
        if (!isCancelled) setStockSummary(null)
        return
      }

      setLoadingSummary(true)
      try {
        const res = await api.get(`/v1/inventory-used/items/${form.itemId}/stock`, { params: { exclude_id: 0 } })
        const data = res?.data?.data as InventoryStockSummaryApi | undefined
        if (!isCancelled && data) setStockSummary(mapStockSummary(data))
      } catch (error) {
        console.error("GET INVENTORY STOCK SUMMARY ERROR:", error)
        if (!isCancelled) setStockSummary(null)
      } finally {
        if (!isCancelled) setLoadingSummary(false)
      }
    }

    void loadSummary()

    return () => {
      isCancelled = true
    }
  }, [form.itemId])

  function clearError(field: string) {
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function updateForm<K extends keyof InventoryUsageForm>(field: K, value: InventoryUsageForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    clearError(field as string)
  }

  function handleItemChange(itemId: string) {
    setForm((prev) => ({ ...prev, itemId, usedUnit: "" }))
    clearError("itemId")
  }


  const liveStock = buildLiveStock(stockSummary, measurementUnits, form.usedQuantity, form.usedMeasurement, form.usedUnit)

  function normalizeUsage(patch: Partial<InventoryUsageForm> = {}) {
    const next = { ...form, ...patch }
    const units = liveStock?.itemUnits ?? measurementUnits
    const unit = units.find((option) => String(option.id) === next.usedUnit)
    const field = next.usedMeasurement.trim() ? "usedMeasurement" : "usedQuantity"
    const result = normalizeAmount(next[field], unit, units)
    if (!result) return
    setForm((prev) => ({ ...prev, [field]: result.value, usedUnit: String(result.unit.id) }))
  }

  function validate(): boolean {
    const result = usageSchema.safeParse(form)
    const fieldErrors: FormErrors = {}
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = String(issue.path[0])
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
    }
    if (!fieldErrors.usedUnit && liveStock && !liveStock.selectedUnit) {
      fieldErrors.usedUnit = "Select a unit of this item's measurement"
    }
    if (!fieldErrors.usedQuantity && liveStock?.exceeds) {
      fieldErrors.usedQuantity = `Cannot exceed the remaining stock of ${liveStock.remainingBefore}`
    }
    setErrors(fieldErrors)
    return Object.keys(fieldErrors).length === 0
  }

  function handleNext() {
    if (!validate()) return
    setStep(2)
  }

  function handleBack() {
    setStep(1)
  }

  async function handleSubmit() {
    if (!validate()) {
      setStep(1)
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        item_id: Number(form.itemId),
        used_quantity: Number(form.usedQuantity),
        used_unit: Number(form.usedUnit),
        used_measurement: form.usedMeasurement ? Number(form.usedMeasurement) : null,
        used_where: form.usedWhere.trim(),
        used_date: form.usedDate,
        remarks: form.remarks.trim() || undefined,
      }

      const res = await api.post("/v1/inventory-used", payload)
      const transactionNumber = res?.data?.data?.transaction_number as string | undefined

      showCmtToast("success", transactionNumber ? `Usage recorded successfully. Transaction: ${transactionNumber}` : "Usage recorded successfully.")

      navigate("/inventory/usage")
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to record the usage. Please try again."
      showCmtToast("expiry", message)
    } finally {
      setSubmitting(false)
    }
  }

  const selectedItem = items.find((item) => String(item.id) === form.itemId) ?? null

  return {
    step,
    items,
    loadingItems,
    selectedItem,
    stockSummary,
    loadingSummary,
    measurementUnits,
    liveStock,
    normalizeUsage,
    form,
    errors,
    submitting,
    updateForm,
    handleItemChange,
    handleNext,
    handleBack,
    handleSubmit,
  }
}
