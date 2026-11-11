import type { Request, Response } from "express"

import { createMeasurement, listMeasurementUnits } from "../services/measurementService"

import type { MeasurementConversionData } from "../inventoryTypes"

const NAME_PATTERN = /^[A-Za-z][A-Za-z\s]{0,49}$/

const cleanName = (value: unknown): string =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ") : ""

export const getMeasurementUnits = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const units = await listMeasurementUnits(req.user.organization_id || null)
  return res.status(200).json({ success: true, data: units })
}

export const postMeasurement = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const rawConversions: unknown[] = Array.isArray(req.body?.conversions) ? req.body.conversions : []

  const conversions: MeasurementConversionData[] = rawConversions.map((entry) => {
    const row = entry as Record<string, unknown>
    return {
      from_quantity: Number(row.from_quantity),
      from_unit: cleanName(row.from_unit),
      to_quantity: Number(row.to_quantity),
      to_unit: cleanName(row.to_unit),
    }
  })

  if (!conversions.length) {
    return res.status(400).json({ success: false, message: "Add at least one conversion" })
  }

  if (conversions.some((row) => !NAME_PATTERN.test(row.from_unit) || !NAME_PATTERN.test(row.to_unit))) {
    return res.status(400).json({ success: false, message: "Every unit needs a valid name (letters only)" })
  }

  if (conversions.some((row) => !(row.from_quantity > 0) || !(row.to_quantity > 0) || !Number.isFinite(row.from_quantity + row.to_quantity))) {
    return res.status(400).json({ success: false, message: "Every quantity must be a number above 0" })
  }

  if (conversions.some((row) => row.from_unit.toLowerCase() === row.to_unit.toLowerCase())) {
    return res.status(400).json({ success: false, message: "Both units in a conversion must be different" })
  }

  const result = await createMeasurement({
    organization_id: req.user.organization_id || null,
    created_by: req.user.id,
    conversions,
  })

  if (result.error) {
    return res.status(409).json({ success: false, message: result.error })
  }

  return res.status(201).json({ success: true, message: "Measurement defined successfully" })
}
