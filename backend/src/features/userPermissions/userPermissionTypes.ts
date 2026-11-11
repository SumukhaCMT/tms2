export interface GrantableSubModule {
  id: number
  sub_module_name: string
  sub_module_code: string
}

export interface PermissionRow {
  sub_module_id: number
  permission: string | null
}

export interface UserPermissionInput {
  sub_module_id: number
  permission: number
}
