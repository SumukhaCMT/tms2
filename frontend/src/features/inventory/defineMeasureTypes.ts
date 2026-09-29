import { z } from "zod"

export interface ConversionRow {
  unitName: string
  factor: string
}

export interface DefineMeasureForm {
  measurementName: string
  baseUnitName: string
  conversions: ConversionRow[]
}

const namePattern = /^[A-Za-z][A-Za-z\s]{0,49}$/

export const defineMeasureSchema = z.object({
  measurementName: z.string().trim().regex(namePattern, "Letters only, up to 50"),
  baseUnitName: z.string().trim().regex(namePattern, "Letters only, up to 50"),
})

export const conversionRowSchema = z.object({
  unitName: z.string().trim().regex(namePattern, "Letters only"),
  factor: z
    .string()
    .trim()
    .regex(/^\d+(\.\d+)?$/, "Numbers only")
    .refine((value) => Number(value) > 0, "Must be above 0"),
})

export function emptyConversionRow(): ConversionRow {
  return { unitName: "", factor: "" }
}

export function emptyDefineMeasureForm(): DefineMeasureForm {
  return { measurementName: "", baseUnitName: "", conversions: [emptyConversionRow()] }
}
