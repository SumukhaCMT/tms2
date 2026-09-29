/* =========================================================
   ROLE
========================================================= */

export interface Role {

  id: number

  user_role: string

  user_role_name: string

  created_at?: Date

  updated_at?: Date
}


/* =========================================================
   ROLE PERMISSION
========================================================= */

export interface RolePermissionInput {

  sub_module_id: number

  permission: number
}


/* =========================================================
   CREATE ROLE INPUT
========================================================= */

export interface CreateRoleInput {

  /*
    User enters only the role name.

    Example:
    "Temple Manager"

    Backend generates:
    "temple_manager"
  */

  user_role_name: string

  permissions: RolePermissionInput[]
}


/* =========================================================
   UPDATE ROLE INPUT
========================================================= */

export interface UpdateRoleInput {

  /*
    Role code is generated automatically
    from user_role_name.
  */

  user_role_name?: string
 user_role?: string
  permissions?: RolePermissionInput[]
}


/* =========================================================
   ROLE DETAILS
========================================================= */

export interface RoleDetails
  extends Role {

  permissions: Array<{

    id: number

    sub_module_id: number

    permission: number

  }>
}