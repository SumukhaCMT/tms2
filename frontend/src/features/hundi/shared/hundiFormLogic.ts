import { z } from "zod"

import { amountInWords, digitsOnly } from "@/features/donations/shared/donationFormLogic"

import type {
  FormErrors,
  WitnessDetailsForm,
  PhysicalItemForm,
  DenominationRow,
} from "./hundiFormTypes"

export { amountInWords, digitsOnly }

export function collectZodErrors<T>(result: { success: boolean; error?: z.ZodError<T> }): FormErrors {
  const fieldErrors: FormErrors = {}
  if (!result.success && result.error) {
    for (const issue of result.error.issues) {
      const key = String(issue.path[0])
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
  }
  return fieldErrors
}

function optionalEmail(message: string) {
  return z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, message)
}

export const witnessDetailsSchema = z.object({
  witnessFullName: z.string().trim().min(3, "Witness full name must be at least 3 letters"),
  witnessDesignation: z.string().trim().optional(),
  witnessEmail: optionalEmail("Enter a valid email address"),
  witnessPhone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^[0-9]{10}$/.test(value), "Enter a valid 10-digit phone number"),
  witnessAddressLine1: z.string().trim().optional(),
  witnessAddressLine2: z.string().trim().optional(),
  witnessCity: z.string().trim().optional(),
  witnessRemarks: z.string().trim().optional(),
})

export const physicalItemSchema = z
  .object({
    itemName: z.string().trim().optional(),
    measurementWeight: z.string().trim().optional(),
    measurement: z.string().trim().optional(),
    quantity: z.string().trim().optional(),
    approximateValue: z.string().trim().optional(),
    exactValue: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.itemName?.trim()) return

    const quantity = Number(data.quantity)
    if (!Number.isInteger(quantity) || quantity <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["quantity"], message: "Enter a valid quantity" })
    }

    const approx = data.approximateValue ? Number(data.approximateValue) : 0
    const exact = data.exactValue ? Number(data.exactValue) : 0

    if (!(approx > 0) && !(exact > 0)) {
      const message = "Enter an approximate value or an exact value"
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["approximateValue"], message })
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["exactValue"], message })
    }
  })

export function emptyWitnessDetails(): WitnessDetailsForm {
  return {
    witnessFullName: "",
    witnessDesignation: "",
    witnessEmail: "",
    witnessPhone: "",
    witnessAddressLine1: "",
    witnessAddressLine2: "",
    witnessCity: "",
    witnessRemarks: "",
  }
}

export function emptyPhysicalItem(): PhysicalItemForm {
  return {
    itemName: "",
    measurementWeight: "",
    measurement: "",
    quantity: "1",
    approximateValue: "",
    exactValue: "",
  }
}

export function denominationLineTotal(row: DenominationRow): number {
  const quantity = Number(row.quantity) || 0
  return quantity * row.value
}

export function denominationsSubtotal(rows: DenominationRow[], type: DenominationRow["type"]): number {
  return rows
    .filter((row) => row.type === type)
    .reduce((sum, row) => sum + denominationLineTotal(row), 0)
}

export function denominationsGrandTotal(rows: DenominationRow[]): number {
  return rows.reduce((sum, row) => sum + denominationLineTotal(row), 0)
}

export function buildHundiSummary(
  rows: DenominationRow[],
  items: PhysicalItemForm[],
): string {
  const cashTotal = denominationsGrandTotal(rows)
  const parts: string[] = []

  if (cashTotal > 0) {
    parts.push(`Total cash counted: ₹${cashTotal.toFixed(2)} (${amountInWords(String(cashTotal))}).`)
  } else {
    parts.push("No cash was counted in this hundi.")
  }

  const namedItems = items.filter((row) => row.itemName.trim())
  if (namedItems.length) {
    parts.push(`Physical items found: ${namedItems.map((row) => row.itemName.trim()).join(", ")}.`)
  }

  return parts.join(" ")
}

export function toApiDateTime(value: string): string {
  if (!value) return ""
  return `${value.replace("T", " ")}:00`
}

export function fromApiDateTime(value: string): string {
  if (!value) return ""
  return value.replace(" ", "T").slice(0, 16)
}

export function formatOpenedAtDisplay(value: string): string {
  if (!value) return ""
  const [datePart, timePart] = value.split("T")
  if (!datePart) return value
  const date = new Date(`${datePart}T${timePart || "00:00"}:00`)
  if (Number.isNaN(date.getTime())) return value
  const dateLabel = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  const timeLabel = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  return `${dateLabel}, ${timeLabel}`
}
