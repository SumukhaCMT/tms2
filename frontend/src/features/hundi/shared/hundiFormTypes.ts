export type DenominationType = "note" | "coin"

export interface BasicDetailsForm {
  openedAt: string
  templeId: string
  deityIds: string[]
}

export interface WitnessDetailsForm {
  witnessFullName: string
  witnessDesignation: string
  witnessEmail: string
  witnessPhone: string
  witnessAddressLine1: string
  witnessAddressLine2: string
  witnessCity: string
  witnessRemarks: string
}

export interface DenominationRow {
  id: number
  value: number
  type: DenominationType
  quantity: string
}

export interface DenominationOption {
  id: number
  denomination: number
  type: DenominationType
  sort_order: number
}

export interface PhysicalItemForm {
  itemName: string
  measurementWeight: string
  measurement: string
  quantity: string
  approximateValue: string
  exactValue: string
}

export interface RemarksForm {
  generalRemark: string
}

export interface DeityOption {
  id: number
  name: string
}

export interface TempleOption {
  id: number
  temp_name: string
}

export type { MeasurementUnitOption } from "@/features/inventory/shared/inventoryFormTypes"

export interface CreatedHundi {
  id: number
  define_hundi_id: number
  hundi_number: string
  hundi_name: string
  deity_id: number
  deity_name: string
}

export type FormErrors = Record<string, string>
