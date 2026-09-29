

export type ModuleType =
  | "feature"
  | "capacity"
  | "consumable"

export type CapacityType =
  | "users"
  | "temple"

export type ConsumableType =
  | "sms"
  | "email"
  | "whatsapp"

export type ModuleStatus =
  | "active"
  | "inactive"

export interface Module {
  id: number
  module_code: string
  module_name: string
  module_type: ModuleType
  capacity_type?: CapacityType | null
  consumable_type?: ConsumableType | null
  display_order: number
  status: ModuleStatus
  created_at?: string
  updated_at?: string
}

export interface CreateModulePayload {
  module_code: string
  module_name: string
  module_type: ModuleType
  capacity_type?: CapacityType | null
  consumable_type?: ConsumableType | null
  display_order: number
  status: ModuleStatus
}

export interface UpdateModulePayload
  extends CreateModulePayload {
  id: number
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ModulesResponse {
  success: boolean
  data: Module[]
  pagination: Pagination
}

export interface ModulesState {
  modules: Module[]
  pagination: Pagination
  loading: boolean
  error: string | null
  success: boolean
}