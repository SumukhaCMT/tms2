export type SubModuleStatus = "active" | "inactive"

export interface SubModule {
  id: number
  module_id: number
  sub_module_code: string
  sub_module_name: string
  sub_module_status: SubModuleStatus
  display_order: number
  note: string | null
  created_at: Date
  updated_at: Date
}

export interface SubModulePermissionInput {
  role_id: number
  permission: number | null
}

export interface CreateSubModuleRequest {
  module_id: number
  sub_module_code: string
  sub_module_name: string
  sub_module_status: SubModuleStatus
  display_order: number
  note?: string | null
  permissions: SubModulePermissionInput[]
}

export interface UpdateSubModuleRequest {
  module_id: number
  sub_module_code: string
  sub_module_name: string
  sub_module_status: SubModuleStatus
  display_order: number
  note?: string | null
  permissions: SubModulePermissionInput[]
}

export interface SubModuleWithPermissions extends SubModule {
  permissions: SubModulePermissionInput[]
}