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

  const measurementName = cleanName(req.body?.measurement_name)
  const baseUnitName = cleanName(req.body?.base_unit_name)
  const rawConversions: unknown[] = Array.isArray(req.body?.conversions) ? req.body.conversions : []

  if (!NAME_PATTERN.test(measurementName)) {
    return res.status(400).json({ success: false, message: "Enter a valid measurement name (letters only)" })
  }

  if (!NAME_PATTERN.test(baseUnitName)) {
    return res.status(400).json({ success: false, message: "Enter a valid base unit name (letters only)" })
  }

  const conversions: MeasurementConversionData[] = rawConversions.map((entry) => {
    const row = entry as Record<string, unknown>
    return { unit_name: cleanName(row.unit_name), conversion_factor: Number(row.conversion_factor) }
  })

  if (conversions.some((row) => !NAME_PATTERN.test(row.unit_name))) {
    return res.status(400).json({ success: false, message: "Every unit needs a valid name (letters only)" })
  }

  if (conversions.some((row) => !Number.isFinite(row.conversion_factor) || row.conversion_factor <= 0)) {
    return res.status(400).json({ success: false, message: "Every conversion must be a number above 0" })
  }

  const names = [baseUnitName, ...conversions.map((row) => row.unit_name)].map((name) => name.toLowerCase())
  if (new Set(names).size !== names.length) {
    return res.status(400).json({ success: false, message: "Unit names must be unique" })
  }

  const result = await createMeasurement({
    organization_id: req.user.organization_id || null,
    created_by: req.user.id,
    measurement_name: measurementName,
    base_unit_name: baseUnitName,
    conversions,
  })

  if (result.error) {
    return res.status(409).json({ success: false, message: result.error })
  }

  return res.status(201).json({ success: true, message: "Measurement defined successfully" })
}
