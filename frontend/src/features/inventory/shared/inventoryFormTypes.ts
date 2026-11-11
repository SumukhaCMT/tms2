export type InventoryItemType = "consumable" | "non_consumable"

export interface InventoryBasicsForm {
  givenBy: string
  givenAt: string
  itemType: InventoryItemType | ""
}

export interface InventoryItemRow {
  id: number | null
  itemName: string
  stockQuantity: string
  unitId: string
  measurement: string
}

export interface InventoryExtrasForm {
  storedAt: string
  remarks: string
}

export interface MeasurementUnitOption {
  id: number
  unit_name: string
  conversion_factor: number
  is_base: number
  measurement_id: number
}

export interface TempleOption {
  id: number
  temp_name: string
}

export interface InventoryItemSuggestion {
  item_name: string
  item_type: InventoryItemType
  stock_quantity: number
  unit_id: number
  unit_name: string | null
  measurement: string | number | null
  given_by: string | null
  given_at: string | Date
  stored_at: string | null
  remarks: string | null
}

export interface UnitTotal {
  unitId: string
  unitName: string
  total: number
}

export type FormErrors = Record<string, string>
