export const PAGE_SIZE = 10

export type InventoryItemType = "consumable" | "non_consumable"

export interface InventoryApiRow {
  id: number
  inventory_item_name: string
  inventory_item_type: InventoryItemType
  inventory_stock_quantity: number
  stock_left: number
  inventory_created_at: string
  temp_name: string
  created_by_name: string | null
}

export interface InventoryRow {
  id: number
  dbId: number
  itemName: string
  itemType: InventoryItemType
  stock: number
  stockLeft: number
  date: string
  templeName: string
  createdByName: string
}

export interface InventoryGroupApi {
  id: number
  temp_name: string
  given_by: string | null
  given_at: string
  item_type: InventoryItemType
  stored_at: string | null
  remarks: string | null
  items: {
    id: number
    item_name: string
    stock_quantity: number
    unit_id: number
    measurement: string | number | null
  }[]
}
