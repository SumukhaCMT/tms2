import {
  findTakenUnitNames,
  getMeasurementUnitById,
  getMeasurementUnitsForOrganization,
  insertMeasurement,
  isMeasurementNameTaken,
} from "../repositories/measurementRepository"

import type { CreateMeasurementData, InventoryStockSummary, MeasurementUnitOption } from "../inventoryTypes"

export const listMeasurementUnits = async (organizationId: number | null): Promise<MeasurementUnitOption[]> => {
  return getMeasurementUnitsForOrganization(organizationId)
}

export const createMeasurement = async (data: CreateMeasurementData): Promise<{ error: string | null }> => {
  if (await isMeasurementNameTaken(data.organization_id, data.measurement_name)) {
    return { error: `Measurement "${data.measurement_name}" already exists` }
  }

  const unitNames = [data.base_unit_name, ...data.conversions.map((row) => row.unit_name)]
  const taken = await findTakenUnitNames(data.organization_id, unitNames)
  if (taken.length > 0) {
    return { error: `Unit "${taken[0]}" is already defined` }
  }

  await insertMeasurement(data)
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
