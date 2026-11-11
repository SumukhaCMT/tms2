import { formatQuantity } from "./shared/inventoryFormLogic"

export type InventoryItemType = "consumable" | "non_consumable"

export interface InventoryItemOptionApi {
  id: number
  inventory_item_name: string
  inventory_item_type: InventoryItemType
}

export interface InventoryStockSummaryApi {
  id: number
  inventory_organization_id: number
  inventory_temple_id: number
  inventory_item_name: string
  inventory_item_type: InventoryItemType
  total_stock: number
  total_used: number
  total_remaining: number
  unit_name: string
  measurement: number | null
  measurement_id: number | null
  total_stock_base: number
  total_used_base: number
  total_remaining_base: number
}

export interface InventoryUsedListItemApi {
  id: number
  transaction_number: string
  item_id: number
  item_name: string
  item_type: InventoryItemType
  total_stock: number
  total_used: number
  total_remaining: number
  used_date: string
  used_by_name: string
}

export interface InventoryUsedDetailApi {
  id: number
  inventory_organization_id: number
  inventory_temple_id: number
  transaction_number: string
  item_id: number
  item_name: string
  item_type: InventoryItemType
  used_quantity: number
  used_unit: number
  unit_name: string
  used_measurement: number | null
  used_where: string
  used_date: string
  remarks: string | null
  used_by_name: string
  total_stock: number
  total_used: number
  total_remaining: number
  stock_unit_name: string
  stock_measurement: number | null
}

export type FormErrors = Record<string, string>

export interface InventoryUsageForm {
  itemId: string
  usedQuantity: string
  usedUnit: string
  usedMeasurement: string
  usedWhere: string
  usedDate: string
  remarks: string
}

export function emptyInventoryUsageForm(): InventoryUsageForm {
  return {
    itemId: "",
    usedQuantity: "",
    usedUnit: "",
    usedMeasurement: "",
    usedWhere: "",
    usedDate: "",
    remarks: "",
  }
}

export function itemTypePlainLabel(value: string): string {
  if (value === "consumable") return "Consumable"
  if (value === "non_consumable") return "Non Consumable"
  return value
}

export function formatUsedDateDisplay(value: string): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

export function formatStockAmount(quantity: number, unitName: string, measurement: number | null): string {
  const amount = formatQuantity(quantity)
  const unit = unitName.trim()
  if (!unit) return amount
  if (!measurement || Number(measurement) === 1) return `${amount} ${unit}`
  return `${amount} × ${formatQuantity(Number(measurement))} ${unit} (${formatQuantity(quantity * Number(measurement))} ${unit})`
}
