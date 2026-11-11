import {
  getMeasurementUnitById,
  getMeasurementUnitsForOrganization,
  insertMeasurementUnits,
} from "../repositories/measurementRepository"

import type { CreateMeasurementData, InventoryStockSummary, MeasurementUnitOption, NewMeasurementUnits } from "../inventoryTypes"

const unitKey = (name: string) => name.toLowerCase()

export const listMeasurementUnits = async (organizationId: number | null): Promise<MeasurementUnitOption[]> => {
  return getMeasurementUnitsForOrganization(organizationId)
}

export const createMeasurement = async (data: CreateMeasurementData): Promise<{ error: string | null }> => {
  const existing = await getMeasurementUnitsForOrganization(data.organization_id)
  const known = new Map(
    existing.map((unit) => [unitKey(unit.unit_name), { group: `m${unit.measurement_id}`, factor: unit.conversion_factor, shared: unit.organization_id === null }]),
  )
  const groups = new Map<string, NewMeasurementUnits>()

  const add = (name: string, group: string, factor: number, isBase: number) => {
    known.set(unitKey(name), { group, factor, shared: false })
    const entry = groups.get(group) ?? { measurement_id: group.startsWith("m") ? Number(group.slice(1)) : null, units: [] }
    entry.units.push([name, factor, isBase])
    groups.set(group, entry)
  }

  for (const row of data.conversions) {
    const from = known.get(unitKey(row.from_unit))
    const to = known.get(unitKey(row.to_unit))

    if (from && to) return { error: `${row.from_unit} and ${row.to_unit} are already defined` }
    if ((from?.shared || to?.shared) && data.organization_id) {
      return { error: `${from ? row.from_unit : row.to_unit} is a shared unit and cannot be extended` }
    }

    if (to) add(row.from_unit, to.group, (row.to_quantity * to.factor) / row.from_quantity, 0)
    else if (from) add(row.to_unit, from.group, (row.from_quantity * from.factor) / row.to_quantity, 0)
    else {
      const group = `n${groups.size}`
      add(row.to_unit, group, 1, 1)
      add(row.from_unit, group, row.to_quantity / row.from_quantity, 0)
    }
  }

  await insertMeasurementUnits(data.organization_id, data.created_by, [...groups.values()])
  return { error: null }
}

export const checkUsageAgainstStock = async (
  summary: InventoryStockSummary,
  usedUnitId: number,
  usedQuantity: number,
  usedMeasurement: number | null,
): Promise<string | null> => {
  const unit = await getMeasurementUnitById(usedUnitId)
  if (!unit) return "Select a valid measurement unit"
  if (summary.measurement_id && unit.measurement_id !== summary.measurement_id) {
    return "Selected unit does not match the item's measurement"
  }
  const usedBase = usedQuantity * (usedMeasurement || 1) * unit.conversion_factor
  if (usedBase > summary.total_remaining_base + 1e-9) {
    return "Quantity used cannot exceed the remaining stock"
  }
  return null
}
