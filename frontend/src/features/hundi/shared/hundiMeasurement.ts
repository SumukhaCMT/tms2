import type { MeasurementUnitOption } from "@/features/inventory/shared/inventoryFormTypes"
import { formatBaseAmount } from "@/features/inventory/shared/measurementMath"

import type { PhysicalItemForm } from "./hundiFormTypes"

export interface MeasurementTotal {
  measurementName: string
  total: string
}

function itemBase(row: PhysicalItemForm, unit: MeasurementUnitOption) {
  return (Number(row.quantity) || 1) * (Number(row.measurementWeight) || 1) * unit.conversion_factor
}

function groupUnits(units: MeasurementUnitOption[], measurementId: number) {
  return units.filter((unit) => unit.measurement_id === measurementId)
}

export function hundiItemTotal(row: PhysicalItemForm, units: MeasurementUnitOption[]): string | null {
  const unit = units.find((option) => option.unit_name === row.measurement)
  if (!unit || !row.measurementWeight) return null
  return formatBaseAmount(itemBase(row, unit), groupUnits(units, unit.measurement_id), unit.unit_name)
}

export function hundiMeasurementTotals(rows: PhysicalItemForm[], units: MeasurementUnitOption[]): MeasurementTotal[] {
  const totals = new Map<number, number>()
  for (const row of rows) {
    const unit = units.find((option) => option.unit_name === row.measurement)
    if (!unit || !row.itemName.trim() || !row.measurementWeight) continue
    totals.set(unit.measurement_id, (totals.get(unit.measurement_id) ?? 0) + itemBase(row, unit))
  }
  return [...totals].map(([measurementId, base]) => {
    const group = groupUnits(units, measurementId)
    return { measurementName: group[0]?.measurement_name ?? "", total: formatBaseAmount(base, group) }
  })
}
