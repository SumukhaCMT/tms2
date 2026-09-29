export type InventoryItemType = "consumable" | "non_consumable"

export interface InventoryRow {
  id: number
  inventory_organization_id: number
  inventory_temple_id: number
  inventory_user_id: number
  inventory_item_name: string
  inventory_item_code: string | null
  inventory_item_type: InventoryItemType
  inventory_unit: number
  inventory_measurement: number | null
  inventory_stock_quantity: number
  inventory_given_by: string | null
  inventory_stored_at: string | null
  inventory_created_at: Date
  inventory_updated_at: Date
  inventory_deleted_at: Date | null
}

export interface InventoryListItem {
  id: number
  inventory_item_name: string
  inventory_item_type: InventoryItemType
  inventory_stock_quantity: number
  stock_left: number
  inventory_created_at: Date
  temp_name: string
  created_by_name: string | null
}

export interface InventoryListScope {
  organization_id: number
  temple_id: number
}

export interface InventoryDetail {
  id: number
  inventory_organization_id: number
  inventory_temple_id: number
  temp_name: string
  inventory_item_name: string
  inventory_item_code: string | null
  inventory_item_type: InventoryItemType
  inventory_unit: number
  unit_name: string
  inventory_measurement: number | null
  inventory_stock_quantity: number
  stock_left: number
  inventory_given_by: string | null
  inventory_stored_at: string | null
  inventory_created_at: Date
  created_by_name: string | null
  created_by_role_id: number
  remarks: string | null
}

export interface InventoryUsageHistoryItem {
  id: number
  transaction_number: string
  used_quantity: number
  unit_name: string | null
  used_measurement: number | null
  used_where: string
  used_date: Date
  remarks: string | null
  used_by_name: string
}

export interface InventoryBatchItemData {
  id: number | null
  item_name: string
  stock_quantity: number
  unit_id: number
  measurement: number | null
}

export interface InventoryBatchData {
  given_by: string
  given_at: string
  item_type: InventoryItemType
  stored_at: string | null
  remarks: string | null
  items: InventoryBatchItemData[]
}

export interface CreateInventoryData extends InventoryBatchData {
  organization_id: number
  temple_id: number
  created_by: number
}

export interface CreateInventoryResultRow {
  id: number
  item_name: string
  item_code: string | null
  item_type: InventoryItemType
}

export interface InventoryGroupItem {
  id: number
  item_name: string
  item_code: string | null
  stock_quantity: number
  unit_id: number
  unit_name: string
  measurement: number | null
}

export interface InventoryGroup {
  id: number
  organization_id: number
  temple_id: number
  temp_name: string
  given_by: string | null
  given_at: string
  item_type: InventoryItemType
  stored_at: string | null
  remarks: string | null
  created_by_name: string | null
  created_by_role_id: number
  items: InventoryGroupItem[]
}

export interface TempleOption {
  id: number
  temp_name: string
}

export interface GivenBySuggestion {
  given_by: string
}

export interface InventoryItemSuggestion {
  item_name: string
  stock_quantity: number
  unit_id: number
  unit_name: string | null
  measurement: number | null
}

export interface InventoryItemOption {
  id: number
  inventory_item_name: string
  inventory_item_type: InventoryItemType
}

export interface InventoryStockSummary {
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

export interface InventoryUsedListItem {
  id: number
  transaction_number: string
  item_id: number
  item_name: string
  item_type: InventoryItemType
  total_stock: number
  total_used: number
  total_remaining: number
  used_date: Date
  used_by_name: string
}

export interface InventoryUsedDetail {
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
  used_date: Date
  remarks: string | null
  used_by_name: string
  total_stock: number
  total_used: number
  total_remaining: number
  stock_unit_name: string
  stock_measurement: number | null
}

export interface CreateInventoryUsedData {
  organization_id: number
  temple_id: number
  created_by: number
  item_id: number
  used_quantity: number
  used_unit: number
  used_measurement: number | null
  used_where: string
  used_date: string
  remarks: string | null
}

export interface UpdateInventoryUsedData {
  item_id: number
  used_quantity: number
  used_unit: number
  used_measurement: number | null
  used_where: string
  used_date: string
  remarks: string | null
}

export interface MeasurementUnitOption {
  id: number
  unit_name: string
  conversion_factor: number
  is_base: number
  measurement_id: number
  measurement_name: string
}

export interface MeasurementConversionData {
  unit_name: string
  conversion_factor: number
}

export interface CreateMeasurementData {
  organization_id: number | null
  created_by: number
  measurement_name: string
  base_unit_name: string
  conversions: MeasurementConversionData[]
}
