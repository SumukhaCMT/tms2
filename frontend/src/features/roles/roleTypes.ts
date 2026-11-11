/* =========================================================
   ROLE STATUS
========================================================= */

export type RoleStatus =
  | "active"
  | "inactive"


/* =========================================================
   ROLE PERMISSION
========================================================= */

export interface RolePermission {
  sub_module_id: number
  permission: number
}


/* =========================================================
   ROLE
========================================================= */

export interface Role {
  id: number
  user_role: string
  user_role_name: string
  created_at?: string
  updated_at?: string
}


/* =========================================================
   ROLE DETAILS
========================================================= */

export interface RoleDetails
  extends Role {

  permissions: RolePermission[]
}


/* =========================================================
   CREATE ROLE
========================================================= */

export interface CreateRolePayload {

  // user_role: string

  user_role_name: string

  permissions: RolePermission[]
}


/* =========================================================
   UPDATE ROLE
========================================================= */

export interface UpdateRolePayload {

  user_role: string

  user_role_name: string

  // permissions?: RolePermission[]
}


/* =========================================================
   UPDATE REQUEST
========================================================= */

export interface UpdateRoleRequest {

  id: number

  data: UpdateRolePayload
}


/* =========================================================
   API RESPONSE
========================================================= */

export interface RolesResponse {

  success: boolean

  message: string

  data: Role[]
}


/* =========================================================
   SINGLE ROLE RESPONSE
========================================================= */

export interface RoleResponse {

  success: boolean

  message: string

  data: RoleDetails
}


/* =========================================================
   ROLE FORM DATA
========================================================= */

export interface RoleFormData {

  user_role: string

  user_role_name: string

  permissions: RolePermission[]
}


/* =========================================================
   ROLE STATE
========================================================= */

export interface RoleState {

  roles: Role[]

  selectedRole: RoleDetails | null

  loading: boolean

  saving: boolean

  deleting: boolean

  error: string | null

  success: string | null
}