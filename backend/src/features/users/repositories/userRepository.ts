import { searchCondition, sqlDate } from "../../../utils/search"
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise"

import pool from "../../../config/database"
import { USER_LIMIT_SQL } from "../../../utils/subscriptionScope"

import type { CreateUserRecord, TempleTransferRecord, UpdateUserRecord, UserDetails, UserListItem } from "../usersTypes"

export const findUsersByOrganization = async (organizationId: number, search = "") => {
  const filter = searchCondition(search, ["u.user_code", "u.user_name", "t.temp_name", "u.user_email", "u.user_phone", "r.user_role", "r.user_role_name", "u.user_status", sqlDate("u.created_at")])
  const [rows] = await pool.execute<(RowDataPacket & UserListItem)[]>(
    `SELECT u.id, u.user_code, u.user_name, u.user_email, u.user_phone, u.role_id, r.user_role,
            u.user_status, u.temple_id, t.temp_name, u.created_at
     FROM users u
     JOIN default_roles r ON r.id = u.role_id
     LEFT JOIN temples t ON t.id = u.temple_id
     WHERE u.organization_id = ? AND u.role_id NOT IN (1, 2) AND u.deleted_at IS NULL
     ${search ? `AND ${filter.sql}` : ""}
     ORDER BY u.id DESC`,
    search ? [organizationId, ...filter.params] : [organizationId],
  )
  return rows
}

export const findUserInOrganization = async (conn: PoolConnection, id: number, organizationId: number) => {
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT id, user_status, temple_id FROM users
     WHERE id = ? AND organization_id = ? AND role_id NOT IN (1, 2) AND deleted_at IS NULL
     FOR UPDATE`,
    [id, organizationId],
  )
  return rows[0] as { id: number; user_status: string; temple_id: number | null } | undefined
}

export const findUserDetails = async (organizationId: number, id: number) => {
  const [rows] = await pool.execute<(RowDataPacket & UserDetails)[]>(
    `SELECT u.id, u.user_code, u.user_name, u.user_email, u.user_phone, u.role_id, u.user_status,
            u.temple_id, t.temp_name, d.designation_name, r.user_role_name, u.user_last_login_at,
            u.created_at, u.updated_at
     FROM users u
     JOIN default_roles r ON r.id = u.role_id
     LEFT JOIN temples t ON t.id = u.temple_id
     LEFT JOIN users_designations d ON d.id = u.designation_id
     WHERE u.id = ? AND u.organization_id = ? AND u.role_id NOT IN (1, 2) AND u.deleted_at IS NULL`,
    [id, organizationId],
  )
  return rows[0]
}

export const findOwnProfile = async (id: number) => {
  const [rows] = await pool.execute<(RowDataPacket & UserDetails)[]>(
    `SELECT u.id, u.user_code, u.user_name, u.user_email, u.user_phone, u.role_id, u.user_status,
            u.temple_id, t.temp_name, d.designation_name, r.user_role_name, u.user_last_login_at,
            u.created_at, u.updated_at
     FROM users u
     LEFT JOIN default_roles r ON r.id = u.role_id
     LEFT JOIN temples t ON t.id = u.temple_id
     LEFT JOIN users_designations d ON d.id = u.designation_id
     WHERE u.id = ? AND u.deleted_at IS NULL`,
    [id],
  )
  return rows[0]
}

export const lockOrganizationLimit = async (conn: PoolConnection, organizationId: number) => {
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT ${USER_LIMIT_SQL} AS user_limit FROM organizations o WHERE o.id = ? FOR UPDATE`,
    [organizationId],
  )
  return Number(rows[0]?.user_limit ?? 0)
}

export const getOrganizationLimit = async (organizationId: number) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT ${USER_LIMIT_SQL} AS user_limit FROM organizations o WHERE o.id = ?`,
    [organizationId],
  )
  return Number(rows[0]?.user_limit ?? 0)
}

export const countUsers = async (conn: PoolConnection | typeof pool, organizationId: number) => {
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT COUNT(id) AS total FROM users
     WHERE organization_id = ? AND role_id <> 1 AND deleted_at IS NULL`,
    [organizationId],
  )
  return Number(rows[0]?.total ?? 0)
}

export const findTemplesByOrganization = async (organizationId: number) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, temp_name FROM temples WHERE organization_id = ? AND deleted_at IS NULL ORDER BY temp_name ASC`,
    [organizationId],
  )
  return rows as { id: number; temp_name: string }[]
}

export const isTempleInOrganization = async (conn: PoolConnection, templeId: number, organizationId: number) => {
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT id FROM temples WHERE id = ? AND organization_id = ? AND deleted_at IS NULL`,
    [templeId, organizationId],
  )
  return rows.length > 0
}

export const findAssignableRoles = async () => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, user_role_name FROM default_roles WHERE id IN (3,4) ORDER BY id`,
  )
  return rows as { id: number; user_role_name: string }[]
}

export const findUserStatuses = async () => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'user_status'`,
  )
  const columnType = String(rows[0]?.COLUMN_TYPE ?? "")
  return [...columnType.matchAll(/'([^']+)'/g)].map((match) => match[1])
}

export const isEmailOrPhoneTaken = async (conn: PoolConnection, email: string, phone: string, excludeId = 0) => {
  const [rows] = await conn.execute<RowDataPacket[]>(
    `SELECT id FROM users WHERE deleted_at IS NULL AND id <> ? AND (user_email = ? OR user_phone = ?) LIMIT 1`,
    [excludeId, email, phone],
  )
  return rows.length > 0
}

export const upsertDesignation = async (conn: PoolConnection, organizationId: number, name: string) => {
  const [result] = await conn.execute<ResultSetHeader>(
    `INSERT INTO users_designations (organization_id, designation_name) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
    [organizationId, name],
  )
  return result.insertId
}

export const insertUser = async (conn: PoolConnection, data: CreateUserRecord) => {
  const [result] = await conn.execute<ResultSetHeader>(
    `INSERT INTO users (organization_id, designation_id, temple_id, user_code, user_name, user_email, user_phone,
       user_password_hash, role_id, user_status, must_change_password, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
    [
      data.organization_id,
      data.designation_id,
      data.temple_id,
      data.user_code,
      data.user_name,
      data.user_email,
      data.user_phone,
      data.user_password_hash,
      data.role_id,
      data.user_status,
    ],
  )
  return result.insertId
}

export const updateUserStatus = async (conn: PoolConnection, id: number, status: string) => {
  await conn.execute(`UPDATE users SET user_status = ?, updated_at = NOW() WHERE id = ?`, [status, id])
}

export const softDeleteUser = async (conn: PoolConnection, id: number) => {
  await conn.execute(
    `INSERT INTO deleted_users (user_id, name, email, phone, role_id)
     SELECT id, user_name, user_email, user_phone, role_id FROM users WHERE id = ?`,
    [id],
  )
  await conn.execute(
    `UPDATE users SET user_email = NULL, user_phone = NULL, user_status = 'active', deleted_at = NOW(), updated_at = NOW() WHERE id = ?`,
    [id],
  )
}

export const revokeUserSessions = async (conn: PoolConnection, id: number) => {
  await conn.execute(`UPDATE user_auth_sessions SET revoked = 1 WHERE user_id = ? AND revoked = 0`, [id])
}

export const updateUser = async (conn: PoolConnection, id: number, data: UpdateUserRecord) => {
  await conn.execute(
    `UPDATE users SET user_name = ?, user_email = ?, user_phone = ?, role_id = ?, designation_id = ?,
       user_status = ?, updated_at = NOW()
     WHERE id = ?`,
    [data.user_name, data.user_email, data.user_phone, data.role_id, data.designation_id, data.user_status, id],
  )
}

export const updateUserTemple = async (conn: PoolConnection, id: number, templeId: number) => {
  await conn.execute(`UPDATE users SET temple_id = ?, updated_at = NOW() WHERE id = ?`, [templeId, id])
}

export const insertTempleTransfer = async (conn: PoolConnection, data: TempleTransferRecord) => {
  await conn.execute(
    `INSERT INTO user_temple_transfer (user_id, organization_id, from_temple_id, to_temple_id, transferred_by, transfer_reason)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.user_id, data.organization_id, data.from_temple_id, data.to_temple_id, data.transferred_by, data.transfer_reason],
  )
}

const REFERENCE_KEYS = [
  "donation_number", "order_number", "token_receipt_number", "transaction_number", "hundi_name", "deity_name", "temp_name",
  "seva_name", "token_name", "trustee_name", "inventory_item_name", "item_name", "unit_name", "org_name", "user_name",
  "user_role_name", "plan_name", "bundle_name", "module_name", "sub_module_name", "payment_method",
]

const jsonValue = (key: string) => `NULLIF(JSON_UNQUOTE(JSON_EXTRACT(al.new_data, '$.${key}')), 'null')`

const REFERENCE_SQL = `COALESCE(${REFERENCE_KEYS.map(jsonValue).join(", ")})`

export const findUserActivityLogs = async (userId: number) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT al.id, COALESCE(al.table_name, al.module) AS module, al.record_id, ${REFERENCE_SQL} AS reference,
            t.temp_name, al.created_at
     FROM audit_logs al
     LEFT JOIN temples t ON t.id = COALESCE(al.temple_id, ${jsonValue("temple_id")})
     WHERE al.user_id = ? AND al.action = 'insert' AND COALESCE(al.table_name, '') NOT IN ('cart', 'cart_items')
     ORDER BY al.id DESC LIMIT 500`,
    [userId],
  )
  return rows
}

export const findUserTransfers = async (userId: number, organizationId: number) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT tt.id, ft.temp_name AS from_temple, nt.temp_name AS to_temple, tt.transfer_reason,
            u.user_name AS transferred_by, tt.transferred_at
     FROM user_temple_transfer tt
     LEFT JOIN temples ft ON ft.id = tt.from_temple_id
     LEFT JOIN temples nt ON nt.id = tt.to_temple_id
     LEFT JOIN users u ON u.id = tt.transferred_by
     WHERE tt.user_id = ? AND tt.organization_id = ?
     ORDER BY tt.transferred_at DESC`,
    [userId, organizationId],
  )
  return rows
}

export const findUserLogins = async (userId: number) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, login_at, ip_address, user_agent, success, failure_reason, event_type
     FROM login_history WHERE user_id = ? ORDER BY login_at DESC LIMIT 100`,
    [userId],
  )
  return rows
}
