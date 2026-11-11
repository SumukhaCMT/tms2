import type { PoolConnection, RowDataPacket } from "mysql2/promise"

import  pool  from "../../../config/database"
import type { SubModulePermissionInput } from "../subModuleTypes"

interface PermissionRow extends RowDataPacket {
  id: number
  role_id: number
  sub_module_id: number
  permission: number | null
  created_at: Date
  updated_at: Date
}

export const createDefaultPermissions = async (
  connection: PoolConnection,
  subModuleId: number,
  permissions: SubModulePermissionInput[],
): Promise<void> => {
  if (!permissions.length) return

  await connection.query(
    `INSERT INTO default_permissions (role_id, sub_module_id, permission) VALUES ?`,
    [permissions.map((item) => [item.role_id, subModuleId, item.permission])],
  )
}

export const deleteBySubModuleId = async (
  connection: PoolConnection,
  subModuleId: number,
): Promise<void> => {
  await connection.execute(
    `
      DELETE FROM default_permissions
      WHERE sub_module_id = ?
    `,
    [subModuleId],
  )
}

export const findBySubModuleId = async (
  subModuleId: number,
): Promise<PermissionRow[]> => {
  const [rows] = await pool.execute<PermissionRow[]>(
    `
      SELECT
        id,
        role_id,
        sub_module_id,
        permission,
        created_at,
        updated_at
      FROM default_permissions
      WHERE sub_module_id = ?
      ORDER BY role_id ASC
    `,
    [subModuleId],
  )

  return rows
}
export const findBySubModuleIds = async (
  subModuleIds: number[],
): Promise<PermissionRow[]> => {
  if (!subModuleIds.length) return []

  const [rows] = await pool.query<PermissionRow[]>(
    `
      SELECT
        id,
        role_id,
        sub_module_id,
        permission,
        created_at,
        updated_at
      FROM default_permissions
      WHERE sub_module_id IN (?)
      ORDER BY role_id ASC
    `,
    [subModuleIds],
  )

  return rows
}
