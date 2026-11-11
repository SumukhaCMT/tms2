import { z } from "zod"

export interface ConversionRow {
  fromQuantity: string
  fromUnit: string
  toQuantity: string
  toUnit: string
}

export interface DefineMeasureForm {
  conversions: ConversionRow[]
}

const quantity = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+)?$/, "Numbers only")
  .refine((value) => Number(value) > 0, "Must be above 0")

const unitName = z.string().trim().regex(/^[A-Za-z][A-Za-z\s]{0,49}$/, "Letters only")

export const conversionRowSchema = z.object({
  fromQuantity: quantity,
  fromUnit: unitName,
  toQuantity: quantity,
  toUnit: unitName,
})

export function emptyConversionRow(): ConversionRow {
  return { fromQuantity: "1", fromUnit: "", toQuantity: "", toUnit: "" }
}

export function emptyDefineMeasureForm(): DefineMeasureForm {
  return { conversions: [emptyConversionRow()] }
}
