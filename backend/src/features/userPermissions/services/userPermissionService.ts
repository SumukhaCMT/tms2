import { HttpError } from "../../../utils/httpError"
import { withTransaction } from "../../../utils/transaction"

import {
  findDefaultPermissions,
  findGrantableSubModules,
  findOrgUserRole,
  findUserSpecialPermissions,
  replaceUserSpecialPermissions,
} from "../repositories/userPermissionRepository"

import type { UserPermissionInput } from "../userPermissionTypes"

const userRole = async (userId: number, organizationId: number) => {
  const roleId = await findOrgUserRole(userId, organizationId)
  if (!roleId) throw new HttpError(404, "User not found")
  return roleId
}

export const getUserPermissionsService = async (organizationId: number, userId: number, adminPermissions: Record<string, number>) => {
  const roleId = await userRole(userId, organizationId)
  const [subModules, defaults, overrides] = await Promise.all([
    findGrantableSubModules(Object.keys(adminPermissions)),
    findDefaultPermissions(roleId),
    findUserSpecialPermissions(userId),
  ])

  const effective = new Map(defaults.map((row) => [row.sub_module_id, row.permission]))
  overrides.forEach((row) => effective.set(row.sub_module_id, row.permission))

  const allowed = new Set(subModules.map((subModule) => subModule.id))
  const permissions = [...effective]
    .filter(([id, permission]) => allowed.has(id) && permission !== null && permission !== "")
    .map(([id, permission]) => ({ sub_module_id: id, permission: Number(permission) }))

  return { sub_modules: subModules, permissions }
}

export const updateUserPermissionsService = async (
  organizationId: number,
  userId: number,
  adminPermissions: Record<string, number>,
  permissions: UserPermissionInput[],
) => {
  await userRole(userId, organizationId)
  const subModules = await findGrantableSubModules(Object.keys(adminPermissions))
  const selected = new Map(permissions.map((item) => [item.sub_module_id, item.permission]))

  const rows = subModules.map((subModule): [number, string] => [
    subModule.id,
    selected.has(subModule.id) ? String(Number(selected.get(subModule.id)) & adminPermissions[subModule.sub_module_code]) : "",
  ])

  await withTransaction((conn) => replaceUserSpecialPermissions(conn, userId, rows))
}
