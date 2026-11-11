import type { ResultSetHeader, RowDataPacket } from "mysql2"
import pool from "../../config/database"

export const SUPER_ADMIN_ROLE_ID = 1
export const ORG_ADMIN_ROLE_ID = 2

export interface ContactUser extends RowDataPacket {
  id: number
  user_name: string
  user_email: string | null
  user_phone: string | null
  organization_id: number | null
  temple_id: number | null
  org_name: string | null
  temp_name: string | null
}

export interface ContactRow extends RowDataPacket {
  id: number
  user_name: string
  user_email: string | null
  user_phone: string | null
  org_name: string | null
  temp_name: string | null
  module_name: string | null
  subject: string
  message: string
  resolved_at: string | null
  created_at: string
}

export const findContactUser = async (userId: number) => {
  const [rows] = await pool.execute<ContactUser[]>(
    `SELECT u.id, u.user_name, u.user_email, u.user_phone, u.organization_id, u.temple_id, o.org_name, t.temp_name
     FROM users u
     LEFT JOIN organizations o ON o.id = u.organization_id
     LEFT JOIN temples t ON t.id = u.temple_id
     WHERE u.id = ? LIMIT 1`,
    [userId],
  )
  return rows[0] ?? null
}

export const insertContact = async (data: {
  user: ContactUser
  sub_module_id: number | null
  other: string | null
  subject: string
  message: string
}) => {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO contact
     (user_id, organization_id, temple_id, user_name, user_email, user_phone, sub_module_id, other, subject, message)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.user.id,
      data.user.organization_id,
      data.user.temple_id,
      data.user.user_name,
      data.user.user_email,
      data.user.user_phone,
      data.sub_module_id,
      data.other,
      data.subject,
      data.message,
    ],
  )
  return result.insertId
}

export const listContacts = async (
  scope: { column: "user_id" | "organization_id"; value: number } | null,
  status: "pending" | "resolved" | undefined,
  limit: number,
  offset: number,
) => {
  const conditions: string[] = []
  const params: number[] = []
  if (scope) {
    conditions.push(`c.${scope.column} = ?`)
    params.push(scope.value)
  }
  if (status) conditions.push(status === "resolved" ? "c.resolved_at IS NOT NULL" : "c.resolved_at IS NULL")
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""

  const [rows] = await pool.query<ContactRow[]>(
    `SELECT c.id, c.user_name, c.user_email, c.user_phone, o.org_name, t.temp_name,
            COALESCE(sm.sub_module_name, c.other) AS module_name, c.subject, c.message, c.resolved_at, c.created_at
     FROM contact c
     LEFT JOIN organizations o ON o.id = c.organization_id
     LEFT JOIN temples t ON t.id = c.temple_id
     LEFT JOIN sub_modules sm ON sm.id = c.sub_module_id
     ${where}
     ORDER BY c.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  )

  const [[count]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM contact c ${where}`,
    params,
  )

  return { rows, total: Number(count.total) }
}

export const resolveContact = async (id: number) => {
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE contact SET resolved_at = NOW() WHERE id = ? AND resolved_at IS NULL",
    [id],
  )
  return result.affectedRows > 0
}

export const findSuperAdminEmails = async () => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT user_name, user_email FROM users
     WHERE role_id = ? AND user_status = 'active' AND deleted_at IS NULL AND user_email IS NOT NULL`,
    [SUPER_ADMIN_ROLE_ID],
  )
  return rows as { user_name: string; user_email: string }[]
}
