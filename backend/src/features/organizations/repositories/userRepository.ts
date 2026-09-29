

import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise"

export interface CreateOrganizationAdminInput {
  organization_id: number
  user_name: string
  user_email: string | null
  user_phone: string | null
  user_password_hash: string
  role_id: number
}

export interface OrganizationUserRow
  extends RowDataPacket {
  id: number
  organization_id: number
  temple_id: number | null
  user_code: string
  user_name: string
  user_email: string | null
  user_phone: string | null
  role_id: number
  user_status: string
  created_at: Date
  updated_at: Date
}

export const userRepository = {
  async findByOrganizationId(
    conn: PoolConnection,
    organizationId: number,
  ) {
    const [rows] =
      await conn.execute<OrganizationUserRow[]>(
        `
        SELECT
          id,
          organization_id,
          temple_id,
          user_code,
          user_name,
          user_email,
          user_phone,
          role_id,
          user_status,
          created_at,
          updated_at
        FROM users
        WHERE organization_id = ?
        ORDER BY id ASC
        `,
        [organizationId],
      )

    return rows
  },

  async createOrganizationAdmin(
    conn: PoolConnection,
    data: CreateOrganizationAdminInput,
  ) {
    const [result] =
      await conn.execute<ResultSetHeader>(
        `
        INSERT INTO users (
          organization_id,
          temple_id,
          user_code,
          user_name,
          user_email,
          user_phone,
          user_password_hash,
          role_id,
          user_status,
          created_at,
          updated_at
        )
        VALUES (
          ?,
          NULL,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          'active',
          NOW(),
          NOW()
        )
        `,
        [
          data.organization_id,
          `ORG${data.organization_id}`,
          data.user_name,
          data.user_email,
          data.user_phone,
          data.user_password_hash,
          data.role_id,
        ],
      )

    return result.insertId
  },
}