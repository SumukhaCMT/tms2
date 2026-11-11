import api from "@/axios/axios"

export type ValidationRule = "email" | "phone" | "number"

export interface UniqueCheck {
  entity: "users" | "organizations" | "temples" | "trustees"
  field: "email" | "phone"
  excludeId?: string | number
}

export const PHONE_LENGTH = 10
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const PHONE_PATTERN = /^\d{10}$/

const patterns: Record<ValidationRule, RegExp> = {
  email: EMAIL_PATTERN,
  phone: PHONE_PATTERN,
  number: /^-?\d+(\.\d+)?$/,
}

const keyPatterns: Record<ValidationRule, RegExp | null> = {
  email: null,
  phone: /\d/,
  number: /[\d.-]/,
}

export const validationMessages: Record<ValidationRule, string> = {
  email: "Enter a valid email address",
  phone: "Phone number must be exactly 10 digits",
  number: "Only numbers are allowed",
}

export function detectRule(type?: string, inputMode?: string): ValidationRule | undefined {
  if (type === "email" || inputMode === "email") return "email"
  if (type === "tel" || inputMode === "tel") return "phone"
  if (type === "number" || inputMode === "numeric" || inputMode === "decimal") return "number"
}

export function validateValue(rule: ValidationRule, value: string) {
  const trimmed = value.trim()
  return !trimmed || patterns[rule].test(trimmed) ? "" : validationMessages[rule]
}

export function isAllowedKey(rule: ValidationRule, key: string) {
  const pattern = keyPatterns[rule]
  return !pattern || key.length !== 1 || pattern.test(key)
}

export async function checkUnique({ entity, field, excludeId }: UniqueCheck, value: string) {
  try {
    const res = await api.get("/v1/validation/unique", { params: { entity, field, value: value.trim(), excludeId } })
    return res.data?.data?.valid === false ? String(res.data.data.message) : ""
  } catch {
    return ""
  }
}
