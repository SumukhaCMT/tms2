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
  for (const item of permissions) {
    await connection.execute(
      `
        INSERT INTO default_permissions (
          role_id,
          sub_module_id,
          permission
        )
        VALUES (?, ?, ?)
      `,
      [
        item.role_id,
        subModuleId,
        item.permission,
      ],
    )
  }
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