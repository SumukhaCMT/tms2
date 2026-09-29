export type SubModuleStatus = "active" | "inactive"

export interface SubModulePermission {
  role_id: number
  permission: number
}

export interface SubModule {
  id: number
  module_id: number
  sub_module_code: string
  sub_module_name: string
  sub_module_status: SubModuleStatus
  display_order: number
  note: string | null
  created_at?: string
  updated_at?: string
  permissions: SubModulePermission[]
}

export interface CreateSubModulePayload {
  module_id: number
  sub_module_code: string
  sub_module_name: string
  sub_module_status: SubModuleStatus
  display_order: number
  note?: string | null
  permissions: SubModulePermission[]
}

export interface UpdateSubModulePayload
  extends CreateSubModulePayload {
  id: number
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface SubModulesResponse {
  success: boolean
  data: SubModule[]
  pagination?: Pagination
}

export interface SubModuleResponse {
  success: boolean
  data: SubModule
  message?: string
}

export interface SubModulesState {
  modules: SubModule[]
  selectedModule: SubModule | null
  pagination: Pagination
  loading: boolean
  error: string | null
  success: boolean
}