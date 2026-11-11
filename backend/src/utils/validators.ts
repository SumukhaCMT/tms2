import { z } from "zod"

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const PHONE_PATTERN = /^\d{10}$/
export const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/

export const VALIDATION_MESSAGES = {
  email: "Enter a valid email address",
  phone: "Phone number must be exactly 10 digits",
  number: "Only numbers are allowed",
} as const

export type FormatRule = keyof typeof VALIDATION_MESSAGES

const patterns: Record<FormatRule, RegExp> = {
  email: EMAIL_PATTERN,
  phone: PHONE_PATTERN,
  number: NUMBER_PATTERN,
}

export const isValidFormat = (rule: FormatRule, value: string) => patterns[rule].test(value.trim())

export const formatError = (rule: FormatRule, value: string) =>
  !value.trim() || isValidFormat(rule, value) ? "" : VALIDATION_MESSAGES[rule]

export const emailSchema = z.string().trim().toLowerCase().max(150).regex(EMAIL_PATTERN, VALIDATION_MESSAGES.email)

export const phoneSchema = z.string().trim().regex(PHONE_PATTERN, VALIDATION_MESSAGES.phone)

export const numberSchema = z.coerce.number({ message: VALIDATION_MESSAGES.number }).refine(Number.isFinite, VALIDATION_MESSAGES.number)

export const optionalEmailSchema = z.union([emailSchema, z.literal(""), z.null()]).optional()

export const optionalPhoneSchema = z.union([phoneSchema, z.literal(""), z.null()]).optional()
