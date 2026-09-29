import { z } from "zod"

import {
  PAN_AADHAAR_THRESHOLD,
  INDIA_STATE_OPTIONS,
  type FormErrors,
  type MonetaryDetailsForm,
  type InkindDetailsForm,
} from "./donationFormTypes"

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "")
}

export function optionalEmail(message: string) {
  return z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || z.string().email().safeParse(value).success,
      message
    )
}

export function numericString(message: string) {
  return z
    .string()
    .trim()
    .min(1, message)
    .regex(/^\d+(\.\d+)?$/, "Enter numbers only")
}

export function normalizeIndiaState(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ""
  const match = INDIA_STATE_OPTIONS.find(
    (option) => option.value.toLowerCase() === trimmed.toLowerCase(),
  )
  return match ? match.value : trimmed
}

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
]
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
]

function twoDigitsToWords(num: number): string {
  if (num <= 0) return ""
  if (num < 20) return ONES[num]
  const tens = Math.floor(num / 10)
  const ones = num % 10
  return `${TENS[tens]}${ones ? " " + ONES[ones] : ""}`
}

function threeDigitsToWords(num: number): string {
  const hundreds = Math.floor(num / 100)
  const rest = num % 100
  const parts: string[] = []
  if (hundreds) parts.push(`${ONES[hundreds]} Hundred`)
  if (rest) parts.push(twoDigitsToWords(rest))
  return parts.join(" ")
}

function numberToIndianWords(num: number): string {
  if (num <= 0) return "Zero"

  const crore = Math.floor(num / 10000000)
  const afterCrore = num % 10000000
  const lakh = Math.floor(afterCrore / 100000)
  const afterLakh = afterCrore % 100000
  const thousand = Math.floor(afterLakh / 1000)
  const hundred = afterLakh % 1000

  const parts: string[] = []
  if (crore) parts.push(`${numberToIndianWords(crore)} Crore`)
  if (lakh) parts.push(`${twoDigitsToWords(lakh)} Lakh`)
  if (thousand) parts.push(`${twoDigitsToWords(thousand)} Thousand`)
  if (hundred) parts.push(threeDigitsToWords(hundred))

  return parts.join(" ").trim()
}

export function amountInWords(rawValue: string): string {
  const value = Number(rawValue)
  if (!rawValue || !Number.isFinite(value) || value <= 0) return ""

  const rupees = Math.floor(value)
  const paise = Math.round((value - rupees) * 100)

  let words = `Rupees ${numberToIndianWords(rupees)}`
  if (paise > 0) {
    words += ` and ${numberToIndianWords(paise)} Paise`
  }
  return `${words} Only`
}

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

export const monetaryDetailsSchema = z
  .object({
    donationMethod: z.string().trim().min(1, "Select a donation method"),
    donationAmount: numericString("Donation amount is required").refine(
      (value) => Number(value) > 0,
      "Donation amount must be greater than 0"
    ),
    bankName: z.string().trim().min(1, "Bank name is required"),
    referenceNumber: z.string().trim().min(1, "Reference number is required"),
    referenceDate: z.string().trim().min(1, "Reference date is required"),
    monetaryRemarks: z.string().trim().optional(),
    panNumber: z.string().trim().optional(),
    aadhaarNumber: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (Number(data.donationAmount) <= PAN_AADHAAR_THRESHOLD) return

    if (!data.panNumber || !/^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/.test(data.panNumber.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["panNumber"],
        message: "PAN is required for donations above ₹50,000 (format: ABCDE1234F)",
      })
    }

    if (!data.aadhaarNumber || !/^[0-9]{12}$/.test(data.aadhaarNumber.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["aadhaarNumber"],
        message: "Aadhaar number is required for donations above ₹50,000 (12 digits)",
      })
    }
  })

export const inkindDetailsSchema = z
  .object({
    itemType: z.string().trim().min(1, "Select an item type"),
    itemTitle: z.string().trim().min(1, "Item title is required"),
    measurement: numericString("Measurement is required").refine(
      (value) => Number(value) > 0,
      "Measurement must be greater than 0"
    ),
    measurementUnit: z.string().trim().min(1, "Measurement unit is required"),
    quantity: numericString("Quantity is required").refine(
      (value) => Number(value) > 0,
      "Quantity must be greater than 0"
    ),
    approxMarketValue: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || /^\d+(\.\d+)?$/.test(value), "Enter numbers only"),
    estimatedValue: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || /^\d+(\.\d+)?$/.test(value), "Enter numbers only"),
    inkindRemarks: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    const approx = data.approxMarketValue ? Number(data.approxMarketValue) : 0
    const estimated = data.estimatedValue ? Number(data.estimatedValue) : 0

    if (approx <= 0 && estimated <= 0) {
      const message = "Enter an approximate market value or an estimated value"
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["approxMarketValue"], message })
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["estimatedValue"], message })
    }
  })

export function emptyMonetaryDetails(): MonetaryDetailsForm {
  return {
    donationMethod: "",
    donationAmount: "",
    bankName: "",
    referenceNumber: "",
    referenceDate: "",
    monetaryRemarks: "",
    panNumber: "",
    aadhaarNumber: "",
  }
}

export function emptyInkindDetails(): InkindDetailsForm {
  return {
    itemType: "",
    itemTitle: "",
    measurement: "",
    measurementUnit: "",
    quantity: "",
    approxMarketValue: "",
    estimatedValue: "",
    inkindRemarks: "",
  }
}

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function parseDateInputValue(value: string): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

export function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}
