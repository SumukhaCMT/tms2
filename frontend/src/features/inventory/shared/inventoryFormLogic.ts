import { z } from "zod"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { toDateInputValue } from "@/features/donations/shared/donationFormLogic"

import type { FormErrors, InventoryBasicsForm, InventoryExtrasForm, InventoryItemRow, UnitTotal } from "./inventoryFormTypes"

export function collectZodErrors<T>(result: { success: boolean; error?: z.ZodError<T> }): FormErrors {
  const fieldErrors: FormErrors = {}
  if (!result.success && result.error) {
    for (const issue of result.error.issues) {
      const key = String(issue.path[0])
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
  }
  return fieldErrors
}

export function slugifyItemCode(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-")
}

export function itemTypeLabel(value: string): string {
  if (value === "consumable") return "Consumable"
  if (value === "non_consumable") return "Non Consumable"
  return value
}

export function toApiDateTime(value: string): string {
  return value ? `${value.replace("T", " ")}:00` : ""
}

export function fromApiDateOnly(value: string): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return toDateInputValue(date)
}

export function formatDateTimeDisplay(value: string): string {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) return value
  return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export function formatQuantity(value: number): string {
  return Number(value.toFixed(3)).toLocaleString("en-IN")
}

export const inventoryBasicsSchema = z.object({
  givenBy: z.string().trim().min(2, "Given by must be at least 2 letters"),
  givenAt: z.string().trim().min(1, "Pick a date"),
  itemType: z.string().trim().min(1, "Select an item type"),
})

export const inventoryItemRowSchema = z.object({
  itemName: z.string().trim().min(2, "Min 2 letters"),
  stockQuantity: z
    .string()
    .trim()
    .regex(/^\d+$/, "Whole number only")
    .refine((value) => Number(value) > 0, "Must be above 0"),
  unitId: z.string().trim().min(1, "Select a unit"),
  measurement: z
    .string()
    .trim()
    .refine((value) => !value || (/^\d+(\.\d+)?$/.test(value) && Number(value) > 0), "Numbers only"),
})

export function emptyInventoryBasics(): InventoryBasicsForm {
  return { givenBy: "", givenAt: "", itemType: "" }
}

export function emptyInventoryItemRow(): InventoryItemRow {
  return { id: null, itemName: "", stockQuantity: "", unitId: "", measurement: "" }
}

export function emptyInventoryExtras(): InventoryExtrasForm {
  return { storedAt: "", remarks: "" }
}

export function rowTotal(row: InventoryItemRow): number {
  return (Number(row.stockQuantity) || 0) * (Number(row.measurement) || 1)
}

export function totalStockQuantity(rows: InventoryItemRow[]): number {
  return rows.reduce((sum, row) => sum + (Number(row.stockQuantity) || 0), 0)
}

export function unitTotals(rows: InventoryItemRow[], unitName: (unitId: string) => string): UnitTotal[] {
  const totals = new Map<string, number>()
  for (const row of rows) {
    if (!row.unitId) continue
    totals.set(row.unitId, (totals.get(row.unitId) ?? 0) + rowTotal(row))
  }
  return [...totals].map(([unitId, total]) => ({ unitId, unitName: unitName(unitId), total }))
}

export function buildInventoryPayload(basics: InventoryBasicsForm, items: InventoryItemRow[], extras: InventoryExtrasForm) {
  return {
    given_by: basics.givenBy.trim(),
    given_at: toApiDateTime(basics.givenAt),
    item_type: basics.itemType,
    stored_at: extras.storedAt.trim() || null,
    remarks: extras.remarks.trim() || null,
    items: items.map((row) => ({
      id: row.id,
      item_name: row.itemName.trim(),
      stock_quantity: Number(row.stockQuantity),
      unit_id: Number(row.unitId),
      measurement: row.measurement ? Number(row.measurement) : null,
    })),
  }
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
}

export function openInventoryReceipt(inventoryId: number, mode: "download" | "print"): Promise<void> {
  return api
    .get(`/v1/inventory/${inventoryId}/receipt`, { responseType: "blob" })
    .then((res) => {
      const blobUrl = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }))
      if (mode === "download") {
        const link = document.createElement("a")
        link.href = blobUrl
        link.download = `Inventory-Receipt-${inventoryId}.pdf`
        document.body.appendChild(link)
        link.click()
        link.remove()
      } else {
        window.open(blobUrl, "_blank")
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    })
    .catch(() => showCmtToast("expiry", "Failed to load the receipt. Please try again."))
}
