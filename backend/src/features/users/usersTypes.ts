export interface UserListItem {
  id: number
  user_code: string
  user_name: string
  user_email: string | null
  user_phone: string | null
  role_id: number
  user_role: string
  user_status: string
  temple_id: number
  temp_name: string
  created_at: string
}

export interface UserLimit {
  limit: number
  used: number
  remaining: number
}

export interface CreateUserInput {
  temple_id: number
  user_name: string
  user_email: string
  user_phone: string
  role_id: number
  designation_name: string
  user_status: string
}

export interface CreateUserRecord extends CreateUserInput {
  organization_id: number
  user_code: string
  user_password_hash: string
  designation_id: number
}

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
  user_role_name: string
  user_last_login_at: string | null
  created_at: string
  updated_at: string
}

export type UpdateUserInput = Omit<CreateUserInput, "temple_id">

export interface UpdateUserRecord extends Omit<UpdateUserInput, "designation_name"> {
  designation_id: number
}

export interface TransferTempleInput {
  to_temple_id: number
  transfer_reason: string
}

export interface TempleTransferRecord extends TransferTempleInput {
  user_id: number
  organization_id: number
  from_temple_id: number
  transferred_by: number
}

export interface UserActivity {
  logs: RowsOf<"id" | "module" | "record_id" | "reference" | "temp_name" | "created_at">
  transfers: RowsOf<"id" | "from_temple" | "to_temple" | "transfer_reason" | "transferred_by" | "transferred_at">
  logins: RowsOf<"id" | "login_at" | "ip_address" | "user_agent" | "success" | "failure_reason" | "event_type">
}

type RowsOf<K extends string> = Record<K, string | number | null>[]
