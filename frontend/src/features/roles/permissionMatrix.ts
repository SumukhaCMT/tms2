export type RolePermission = {
  sub_module_id: number
  permission: number
}

export type PermissionType = "view" | "add" | "edit" | "delete"

const PERMISSION = {
  ADD: 4,
  EDIT: 2,
  DELETE: 1,
} as const


export function getPermission(
  permissions: RolePermission[],
  subModuleId: number,
): number {
  return (
    permissions.find(
      (item) =>
        item.sub_module_id ===
        subModuleId,
    )?.permission ?? 0
  )
}


export function hasPermission(
  permission: number,
  type: PermissionType,
): boolean {
  if (type === "view") {
    return true
  }

  const bit =
    type === "add"
      ? PERMISSION.ADD
      : type === "edit"
        ? PERMISSION.EDIT
        : PERMISSION.DELETE

  return (
    (permission & bit) === bit
  )
}


export function calculatePermission(
  currentPermission: number,
  type: PermissionType,
): number {
  if (type === "view") {
    return currentPermission
  }

  const bit =
    type === "add"
      ? PERMISSION.ADD
      : type === "edit"
        ? PERMISSION.EDIT
        : PERMISSION.DELETE

  const enabled =
    (currentPermission & bit) === bit

  if (enabled) {
    return currentPermission & ~bit
  }

  return currentPermission | bit
}
