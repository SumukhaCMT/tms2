import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { z } from "zod"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"

import type { MeasurementUnitOption } from "./shared/inventoryFormTypes"
import { buildLiveStock, normalizeAmount } from "./shared/measurementMath"
import {
  emptyInventoryUsageForm,
  type InventoryItemOptionApi,
  type InventoryStockSummaryApi,
  type InventoryUsedDetailApi,
  type InventoryUsageForm,
  type FormErrors,
} from "./inventoryUsageTypes"
import { fromApiDateOnly } from "./shared/inventoryFormLogic"

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

export function useEditInventoryUsage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [items, setItems] = useState<InventoryItemOptionApi[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [stockSummary, setStockSummary] = useState<InventoryStockSummaryApi | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [measurementUnits, setMeasurementUnits] = useState<MeasurementUnitOption[]>([])
  const [form, setForm] = useState<InventoryUsageForm>(() => emptyInventoryUsageForm())
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [loadingRecord, setLoadingRecord] = useState(true)
  const [transactionNumber, setTransactionNumber] = useState("")

  useEffect(() => {
    if (!id) return
    let active = true

    async function loadRecord() {
      try {
        const res = await api.get(`/v1/inventory-used/${id}`)
        const detail = res?.data?.data as InventoryUsedDetailApi | undefined
        if (!detail || !active) return

        setTransactionNumber(detail.transaction_number)
        setForm({
          itemId: String(detail.item_id),
          usedQuantity: String(detail.used_quantity),
          usedUnit: String(detail.used_unit),
          usedMeasurement: detail.used_measurement ? String(detail.used_measurement) : "",
          usedWhere: detail.used_where,
          usedDate: fromApiDateOnly(detail.used_date),
          remarks: detail.remarks ?? "",
        })
      } catch {
        if (active) {
          showCmtToast("expiry", "Failed to load the usage record. Please try again.")
          navigate("/inventory/usage")
        }
      } finally {
        if (active) setLoadingRecord(false)
      }
    }

    loadRecord()
    return () => {
      active = false
    }
  }, [id, navigate])

  useEffect(() => {
    let active = true

    async function loadItems() {
      setLoadingItems(true)
      try {
        const res = await api.get("/v1/inventory-used/items")
        const data = res?.data?.data
        if (active && Array.isArray(data)) setItems(data)
      } catch {
        void 0
      } finally {
        if (active) setLoadingItems(false)
      }
    }

    loadItems()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadUnits() {
      try {
        const res = await api.get("/v1/inventory/measurements/units")
        const data = res?.data?.data
        if (active && Array.isArray(data)) setMeasurementUnits(data)
      } catch {
        void 0
      }
    }

    loadUnits()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadSummary() {
      if (!form.itemId || !id) {
        if (active) setStockSummary(null)
        return
      }

      setLoadingSummary(true)
      try {
        const res = await api.get(`/v1/inventory-used/items/${form.itemId}/stock`, { params: { exclude_id: id } })
        const data = res?.data?.data as InventoryStockSummaryApi | undefined
        if (active && data) setStockSummary(mapStockSummary(data))
      } catch {
        if (active) setStockSummary(null)
      } finally {
        if (active) setLoadingSummary(false)
      }
    }

    loadSummary()
    return () => {
      active = false
    }
  }, [form.itemId, id])

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

  async function handleSubmit() {
    if (!id || !validate()) return

    setSubmitting(true)
    try {
      await api.put(`/v1/inventory-used/${id}`, {
        item_id: Number(form.itemId),
        used_quantity: Number(form.usedQuantity),
        used_unit: Number(form.usedUnit),
        used_measurement: form.usedMeasurement ? Number(form.usedMeasurement) : null,
        used_where: form.usedWhere.trim(),
        used_date: form.usedDate,
        remarks: form.remarks.trim() || undefined,
      })
      showCmtToast("success", "Usage record updated successfully.")
      navigate("/inventory/usage")
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to update the usage record. Please try again."
      showCmtToast("expiry", message)
    } finally {
      setSubmitting(false)
    }
  }

  function goToUsageList() {
    navigate("/inventory/usage")
  }

  return {
    form,
    errors,
    submitting,
    loadingRecord,
    items,
    loadingItems,
    stockSummary,
    loadingSummary,
    measurementUnits,
    liveStock,
    normalizeUsage,
    transactionNumber,
    updateForm,
    handleSubmit,
    goToUsageList,
  }
}
