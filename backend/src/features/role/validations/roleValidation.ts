import type {
  CreateRoleInput,
  UpdateRoleInput,
} from "../roleTypes"


/* =========================================================
   PERMISSION VALIDATION
========================================================= */

function validatePermission(
  permission: number,
): boolean {

  return (
    Number.isInteger(permission) &&
    permission >= 0 &&
    permission <= 7
  )
}


/* =========================================================
   CREATE ROLE VALIDATION
========================================================= */

export const validateCreateRole = (
  data: CreateRoleInput,
): string | null => {

  if (
    typeof data.user_role_name !== "string" ||
    !data.user_role_name.trim()
  ) {
    return "Role name is required"
  }

  if (
    !Array.isArray(data.permissions)
  ) {
    return "Permissions are required"
  }

  for (
    const item of data.permissions
  ) {

    if (
      !Number.isInteger(item.sub_module_id) ||
      item.sub_module_id <= 0
    ) {
      return "Invalid sub module id"
    }

    if (
      !validatePermission(item.permission)
    ) {
      return "Permission must be between 0 and 7"
    }
  }

  return null
}


/* =========================================================
   UPDATE ROLE VALIDATION
========================================================= */

export const validateUpdateRole = (
  data: UpdateRoleInput,
): string | null => {

  if (
    data.user_role_name !== undefined
  ) {

    if (
      typeof data.user_role_name !== "string" ||
      !data.user_role_name.trim()
    ) {
      return "Role name cannot be empty"
    }
  }

  if (
    data.permissions !== undefined
  ) {

    if (
      !Array.isArray(data.permissions)
    ) {
      return "Permissions must be an array"
    }

    for (
      const item of data.permissions
    ) {

      if (
        !Number.isInteger(item.sub_module_id) ||
        item.sub_module_id <= 0
      ) {
        return "Invalid sub module id"
      }

      if (
        !validatePermission(item.permission)
      ) {
        return "Permission must be between 0 and 7"
      }
    }
  }

  return null
}