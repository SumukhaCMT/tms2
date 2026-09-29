import type { InventoryItemType } from "./inventoryListTypes"

export interface InventoryViewUsage {
  id: number
  transaction_number: string
  used_quantity: number
  unit_name: string | null
  used_measurement: number | null
  used_where: string
  used_date: string
  remarks: string | null
  used_by_name: string
}

export interface InventoryViewDetail {
  id: number
  temp_name: string
  inventory_item_name: string
  inventory_item_code: string | null
  inventory_item_type: InventoryItemType
  unit_name: string | null
  inventory_measurement: number | null
  inventory_stock_quantity: number
  stock_left: number
  inventory_given_by: string | null
  inventory_stored_at: string | null
  inventory_created_at: string
  created_by_name: string
  remarks: string | null
  usages: InventoryViewUsage[]
}
