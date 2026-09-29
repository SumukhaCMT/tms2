import { showCmtToast } from "@/components/ui/cmt-toast"

import { formatQuantity } from "./inventoryFormLogic"
import type { MeasurementUnitOption } from "./inventoryFormTypes"

export interface StockBaseSummary {
  unit_name: string
  measurement_id: number | null
  total_stock_base: number
  total_used_base: number
  total_remaining_base: number
}

export interface LiveStock {
  itemUnits: MeasurementUnitOption[]
  selectedUnit: MeasurementUnitOption | null
  entryBase: number
  exceeds: boolean
  totalStock: string
  alreadyUsed: string
  remainingBefore: string
  totalUsed: string
  remaining: string
}

const isRoundFactor = (factor: number) => Number.isInteger(Math.log10(factor))

export function formatBaseAmount(base: number, units: MeasurementUnitOption[], preferredUnitName = ""): string {
  const candidates = units.filter((unit) => isRoundFactor(unit.conversion_factor) || unit.unit_name === preferredUnitName)
  const pool = (candidates.length ? candidates : units).slice().sort((a, b) => b.conversion_factor - a.conversion_factor)
  if (!pool.length) return formatQuantity(base)
  const magnitude = Math.abs(base)
  const unit = pool.find((option) => magnitude >= option.conversion_factor) ?? pool[pool.length - 1]
  return `${formatQuantity(base / unit.conversion_factor)} ${unit.unit_name}`
}

export function buildLiveStock(
  summary: StockBaseSummary | null,
  units: MeasurementUnitOption[],
  usedQuantity: string,
  usedMeasurement: string,
  usedUnitId: string,
): LiveStock | null {
  if (!summary) return null

  const itemUnits = summary.measurement_id ? units.filter((unit) => unit.measurement_id === summary.measurement_id) : units
  const selectedUnit = itemUnits.find((unit) => String(unit.id) === usedUnitId) ?? null
  const entryBase = selectedUnit
    ? (Number(usedQuantity) || 0) * (Number(usedMeasurement) || 1) * selectedUnit.conversion_factor
    : 0
  const format = (base: number) => formatBaseAmount(base, itemUnits, summary.unit_name)

  return {
    itemUnits,
    selectedUnit,
    entryBase,
    exceeds: entryBase > summary.total_remaining_base + 1e-9,
    totalStock: format(summary.total_stock_base),
    alreadyUsed: format(summary.total_used_base),
    remainingBefore: format(summary.total_remaining_base),
    totalUsed: format(summary.total_used_base + entryBase),
    remaining: format(summary.total_remaining_base - entryBase),
  }
}

export interface NormalizedAmount {
  value: string
  unit: MeasurementUnitOption
}

export function normalizeAmount(
  value: string,
  unit: MeasurementUnitOption | undefined,
  units: MeasurementUnitOption[],
): NormalizedAmount | null {
  const amount = Number(value)
  if (!unit || !value.trim() || !Number.isFinite(amount) || amount <= 0 || !isRoundFactor(unit.conversion_factor)) return null
  const base = amount * unit.conversion_factor
  const target = units
    .filter((option) => option.measurement_id === unit.measurement_id && isRoundFactor(option.conversion_factor))
    .sort((a, b) => b.conversion_factor - a.conversion_factor)
    .find((option) => base >= option.conversion_factor - 1e-9)
  if (!target || target.id === unit.id) return null
  const converted = Number((base / target.conversion_factor).toFixed(6))
  showCmtToast("success", `Converted ${formatQuantity(amount)} ${unit.unit_name} to ${formatQuantity(converted)} ${target.unit_name}`)
  return { value: String(converted), unit: target }
}
