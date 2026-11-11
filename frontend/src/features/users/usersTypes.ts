import { Building2, UserRound, ClipboardCheck } from "lucide-react"

import type { StepDefinition } from "@/features/donations/shared/donationFormTypes"

export const PAGE_SIZE = 11

export interface UserApiRow {
  id: number
  user_code: string
  user_name: string
  user_email: string | null
  user_phone: string | null
  role_id: number
  user_role: string
  user_status: string
  temple_id: number
  temp_name: string | null
  created_at: string
}

export interface UserLimit {
  limit: number
  used: number
  remaining: number
}

export interface TempleOption {
  id: number
  temp_name: string
}

export interface AddUserForm {
  templeId: string
  userName: string
  userEmail: string
  userPhone: string
  roleId: string
  designationName: string
  userStatus: string
}

export type FormErrors = Record<string, string>

export const emptyAddUserForm = (): AddUserForm => ({
  templeId: "",
  userName: "",
  userEmail: "",
  userPhone: "",
  roleId: "",
  designationName: "",
  userStatus: "active",
})

export interface RoleOption {
  value: string
  label: string
}

export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export const ADD_USER_STEPS: readonly StepDefinition[] = [
  { id: 1, label: "Temple", subLabel: "Assign a temple", icon: Building2 },
  { id: 2, label: "User Details", subLabel: "Contact, role and status", icon: UserRound },
  { id: 3, label: "Summary & Submit", subLabel: "Review and confirm", icon: ClipboardCheck },
]

export const apiMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback

export interface UserDetails {
  id: number
  user_code: string
  user_name: string
  user_email: string | null
  user_phone: string | null
  role_id: number
  user_status: string
  temple_id: number | null
  temp_name: string | null
  designation_name: string | null
}

export type EditUserForm = Omit<AddUserForm, "templeId">

export interface TransferForm {
  toTempleId: string
  transferReason: string
}

export const emptyTransferForm = (): TransferForm => ({ toTempleId: "", transferReason: "" })

export const toEditUserForm = (user: UserDetails): EditUserForm => ({
  userName: user.user_name,
  userEmail: user.user_email ?? "",
  userPhone: user.user_phone ?? "",
  roleId: String(user.role_id),
  designationName: user.designation_name ?? "",
  userStatus: user.user_status,
})

export interface UserProfile extends UserDetails {
  user_role_name: string
  user_last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface ActivityLogRow {
  id: number
  module: string
  record_id: number | null
  reference: string | null
  temp_name: string | null
  created_at: string
}

export interface TransferRow {
  id: number
  from_temple: string | null
  to_temple: string | null
  transfer_reason: string | null
  transferred_by: string | null
  transferred_at: string
}

export interface LoginRow {
  id: number
  login_at: string
  ip_address: string
  user_agent: string | null
  success: number
  failure_reason: string | null
  event_type: string
}

export interface UserActivity {
  logs: ActivityLogRow[]
  transfers: TransferRow[]
  logins: LoginRow[]
}

export const formatDateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"

export const formatModule = (value: string) => value.split(/[-_]/).map(capitalize).join(" ")
