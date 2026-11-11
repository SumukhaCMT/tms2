import type { PoolConnection, RowDataPacket } from "mysql2/promise"

import pool from "../../../config/database"

import type { GrantableSubModule, PermissionRow } from "../userPermissionTypes"

export const findOrgUserRole = async (userId: number, organizationId: number) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT role_id FROM users WHERE id = ? AND organization_id = ? AND role_id IN (3, 4) AND deleted_at IS NULL`,
    [userId, organizationId],
  )
  return rows[0] ? Number(rows[0].role_id) : null
}

export const findGrantableSubModules = async (codes: string[]) => {
  if (!codes.length) return []
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT sm.id, sm.sub_module_name, sm.sub_module_code
     FROM sub_modules sm
     JOIN modules m ON m.id = sm.module_id
     WHERE sm.sub_module_code IN (?) AND sm.sub_module_status = 'active' AND m.status = 'active'
     ORDER BY m.id, sm.id`,
    [codes],
  )
  return rows as GrantableSubModule[]
}

export const findDefaultPermissions = async (roleId: number) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT sub_module_id, permission FROM default_permissions WHERE role_id = ?`,
    [roleId],
  )
  return rows as PermissionRow[]
}

export const findUserSpecialPermissions = async (userId: number) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT sub_module_id, permission FROM user_special_permissions WHERE user_id = ?`,
    [userId],
  )
  return rows as PermissionRow[]
}

export const replaceUserSpecialPermissions = async (conn: PoolConnection, userId: number, rows: [number, string][]) => {
  if (!rows.length) return
  await conn.query(`DELETE FROM user_special_permissions WHERE user_id = ? AND sub_module_id IN (?)`, [userId, rows.map(([id]) => id)])
  await conn.query(
    `INSERT INTO user_special_permissions (user_id, sub_module_id, permission) VALUES ?`,
    [rows.map(([subModuleId, permission]) => [userId, subModuleId, permission])],
  )
}
