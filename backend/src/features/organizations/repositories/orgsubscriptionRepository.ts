

import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise"

export interface CreateOrgSubscriptionInput {
  organization_id: number
  subscription_type: "plan" | "bundle"

  plan_id?: number | null

  granted_quantity: number
  remaining_quantity: number

  bundle_id?: number | null

  license_type: string

  is_free_trial: number

  start_date: string
  expiry_date?: string | null

  subscription_status: string
}

export interface OrgSubscriptionRow
  extends RowDataPacket {
  id: number
  organization_id: number
  subscription_type: "plan" | "bundle"
  plan_id: number | null
  bundle_id: number | null
  granted_quantity: number
  remaining_quantity: number
  license_type: string
  is_free_trial: number
  start_date: string
  expiry_date: string | null
  subscription_status: string
  created_at: Date
  updated_at: Date
}

export const orgSubscriptionRepository = {
  async findByOrganizationId(
    conn: PoolConnection,
    organizationId: number,
  ) {
    const [rows] =
      await conn.execute<OrgSubscriptionRow[]>(
        `
        SELECT
          id,
          organization_id,
          subscription_type,
          plan_id,
          bundle_id,
          granted_quantity,
          remaining_quantity,
          license_type,
          is_free_trial,
          start_date,
          expiry_date,
          subscription_status,
          created_at,
          updated_at
        FROM org_subscriptions
        WHERE organization_id = ?
        ORDER BY id DESC
        `,
        [organizationId],
      )

    return rows
  },

  async create(
    conn: PoolConnection,
    data: CreateOrgSubscriptionInput,
  ) {
    const [result] =
      await conn.execute<ResultSetHeader>(
        `
        INSERT INTO org_subscriptions (
          organization_id,
          subscription_type,
          plan_id,
          granted_quantity,
          remaining_quantity,
          bundle_id,
          license_type,
          is_free_trial,
          start_date,
          expiry_date,
          subscription_status,
          created_at,
          updated_at
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          NOW(),
          NOW()
        )
        `,
        [
          data.organization_id,
          data.subscription_type,
          data.plan_id ?? null,
          data.granted_quantity,
          data.remaining_quantity,
          data.bundle_id ?? null,
          data.license_type,
          data.is_free_trial,
          data.start_date,
          data.expiry_date ?? null,
          data.subscription_status,
        ],
      )

    return result.insertId
  },

//   async update(
//   conn: PoolConnection,
//   id: number,
//   data: {
//     granted_quantity?: number
//     remaining_quantity?: number
//     start_date?: string
//     expiry_date?: string | null
//   },
// ) {
//   const fields: string[] = []
//   const values: unknown[] = []

//   if (
//     data.granted_quantity !== undefined
//   ) {
//     fields.push(
//       "granted_quantity = ?",
//     )

//     values.push(
//       data.granted_quantity,
//     )
//   }

//   if (
//     data.remaining_quantity !==
//     undefined
//   ) {
//     fields.push(
//       "remaining_quantity = ?",
//     )

//     values.push(
//       data.remaining_quantity,
//     )
//   }

//   if (
//     data.start_date !== undefined
//   ) {
//     fields.push(
//       "start_date = ?",
//     )

//     values.push(
//       data.start_date,
//     )
//   }

//   if (
//     data.expiry_date !== undefined
//   ) {
//     fields.push(
//       "expiry_date = ?",
//     )

//     values.push(
//       data.expiry_date,
//     )
//   }

//   if (fields.length === 0) {
//     return false
//   }

//   fields.push(
//     "updated_at = NOW()",
//   )

//   values.push(id)

//   const [result] =
//     await conn.execute<ResultSetHeader>(
//       `
//       UPDATE org_subscriptions
//       SET
//         ${fields.join(", ")}
//       WHERE id = ?
//       `,
//       values,
//     )

//   return result.affectedRows > 0
// }




async update(
  conn: PoolConnection,
  id: number,
  data: {
    granted_quantity?: number
    remaining_quantity?: number
    start_date?: string
    expiry_date?: string | null
  },
) {
  const fields: string[] = []

  const values: Array<
    string | number | boolean | null
  > = []

  if (
    data.granted_quantity !== undefined
  ) {
    fields.push(
      "granted_quantity = ?",
    )

    values.push(
      data.granted_quantity,
    )
  }

  if (
    data.remaining_quantity !== undefined
  ) {
    fields.push(
      "remaining_quantity = ?",
    )

    values.push(
      data.remaining_quantity,
    )
  }

  if (
    data.start_date !== undefined
  ) {
    fields.push(
      "start_date = ?",
    )

    values.push(
      data.start_date,
    )
  }

  if (
    data.expiry_date !== undefined
  ) {
    fields.push(
      "expiry_date = ?",
    )

    values.push(
      data.expiry_date,
    )
  }

  if (fields.length === 0) {
    return false
  }

  fields.push(
    "updated_at = NOW()",
  )

  values.push(id)

  const [result] =
    await conn.execute<ResultSetHeader>(
      `
      UPDATE org_subscriptions
      SET
        ${fields.join(", ")}
      WHERE id = ?
      `,
      values,
    )

  return result.affectedRows > 0
},

}
