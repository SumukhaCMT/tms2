import type { FormatRule } from "../../utils/validators"

export interface UniqueTarget {
  table: string
  column: string
  scoped?: boolean
  createOnly?: boolean
}

export interface UniqueField {
  rule: FormatRule
  label: string
  targets: UniqueTarget[]
}

const email = (label: string, targets: UniqueTarget[]): UniqueField => ({ rule: "email", label, targets })
const phone = (label: string, targets: UniqueTarget[]): UniqueField => ({ rule: "phone", label, targets })

export const uniqueRules: Record<string, Record<string, UniqueField>> = {
  users: {
    email: email("email", [{ table: "users", column: "user_email" }]),
    phone: phone("phone number", [{ table: "users", column: "user_phone" }]),
  },
  organizations: {
    email: email("email", [
      { table: "organizations", column: "org_email" },
      { table: "users", column: "user_email", createOnly: true },
    ]),
    phone: phone("phone number", [
      { table: "organizations", column: "org_phone" },
      { table: "users", column: "user_phone", createOnly: true },
    ]),
  },
  temples: {
    email: email("email", [{ table: "temples", column: "temp_email", scoped: true }]),
    phone: phone("phone number", [{ table: "temples", column: "temp_phone", scoped: true }]),
  },
  trustees: {
    email: email("email", [{ table: "trustees", column: "trustee_email", scoped: true }]),
    phone: phone("phone number", [{ table: "trustees", column: "trustee_phone", scoped: true }]),
  },
}
