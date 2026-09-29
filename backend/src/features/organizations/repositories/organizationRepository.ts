import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise"

import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "../organizationTypes"

// ============================================================
// ORGANIZATION ROW
// ============================================================

interface OrganizationRow
  extends RowDataPacket {
  id: number
  org_name: string
  org_img_name: string | null
  org_legal_name: string | null
  org_registration_number: string | null
  org_gst_number: string | null
  org_email: string | null
  org_phone: string | null
  org_address_line1: string | null
  org_address_line2: string | null
  org_city: string | null
  org_state: string | null
  org_country: string | null
  org_pincode: string | null
  org_slug: string | null
  org_status: string
  org_timezone: string
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

// ============================================================
// ORGANIZATION REPOSITORY
// ============================================================

export const organizationRepository = {

  // ============================================================
  // GET ALL ORGANIZATIONS
  // ============================================================

  async findAll(
    conn: PoolConnection,
  ) {
    const [rows] =
      await conn.execute<
        OrganizationRow[]
      >(
        `
        SELECT
          id,
          org_name,
          org_img_name,
          org_legal_name,
          org_registration_number,
          org_gst_number,
          org_email,
          org_phone,
          org_address_line1,
          org_address_line2,
          org_city,
          org_state,
          org_country,
          org_pincode,
          org_slug,
          org_status,
          org_timezone,
          created_at,
          updated_at,
          deleted_at
        FROM organizations
        WHERE deleted_at IS NULL
        ORDER BY id DESC
        `,
      )

    return rows
  },

  // ============================================================
  // GET ORGANIZATION BY ID
  // ============================================================

  async findById(
    conn: PoolConnection,
    id: number,
  ) {
    const [rows] =
      await conn.execute<
        OrganizationRow[]
      >(
        `
        SELECT
          id,
          org_name,
          org_img_name,
          org_legal_name,
          org_registration_number,
          org_gst_number,
          org_email,
          org_phone,
          org_address_line1,
          org_address_line2,
          org_city,
          org_state,
          org_country,
          org_pincode,
          org_slug,
          org_status,
          org_timezone,
          created_at,
          updated_at,
          deleted_at
        FROM organizations
        WHERE id = ?
          AND deleted_at IS NULL
        LIMIT 1
        `,
        [id],
      )

    return rows[0] ?? null
  },

  // ============================================================
  // FIND ORGANIZATION BY EMAIL
  // ============================================================

  async findByEmail(
    conn: PoolConnection,
    email: string,
    excludeId?: number,
  ) {
    const [rows] =
      await conn.execute<
        RowDataPacket[]
      >(
        `
        SELECT id
        FROM organizations
        WHERE org_email = ?
          AND deleted_at IS NULL
          ${
            excludeId !== undefined
              ? "AND id != ?"
              : ""
          }
        LIMIT 1
        `,
        excludeId !== undefined
          ? [email, excludeId]
          : [email],
      )

    return rows[0] ?? null
  },

  // ============================================================
  // FIND ORGANIZATION BY PHONE
  // ============================================================

  async findByPhone(
    conn: PoolConnection,
    phone: string,
    excludeId?: number,
  ) {
    const [rows] =
      await conn.execute<
        RowDataPacket[]
      >(
        `
        SELECT id
        FROM organizations
        WHERE org_phone = ?
          AND deleted_at IS NULL
          ${
            excludeId !== undefined
              ? "AND id != ?"
              : ""
          }
        LIMIT 1
        `,
        excludeId !== undefined
          ? [phone, excludeId]
          : [phone],
      )

    return rows[0] ?? null
  },

  // ============================================================
  // FIND ORGANIZATION BY SLUG
  // ============================================================

  async findSlug(
    conn: PoolConnection,
    slug: string,
    excludeId?: number,
  ) {
    const [rows] =
      await conn.execute<
        RowDataPacket[]
      >(
        `
        SELECT id
        FROM organizations
        WHERE org_slug = ?
          ${
            excludeId !== undefined
              ? "AND id != ?"
              : ""
          }
        LIMIT 1
        `,
        excludeId !== undefined
          ? [slug, excludeId]
          : [slug],
      )

    return rows[0] ?? null
  },

  // ============================================================
  // CREATE ORGANIZATION
  // ============================================================

  // async create(
  //   conn: PoolConnection,
  //   data: CreateOrganizationInput,
  //   slug: string,
  // ) {
  //   const [result] =
  //     await conn.execute<
  //       ResultSetHeader
  //     >(
  //       `
  //       INSERT INTO organizations (
  //         org_name,
  //         org_img_name,
  //         org_legal_name,
  //         org_registration_number,
  //         org_gst_number,
  //         org_email,
  //         org_phone,
  //         org_address_line1,
  //         org_address_line2,
  //         org_city,
  //         org_state,
  //         org_country,
  //         org_pincode,
  //         org_slug,
  //         org_status,
  //         org_timezone,
  //         created_at,
  //         updated_at
  //       )
  //       VALUES (
  //         ?,
  //         ?,
  //         ?,
  //         ?,
  //         ?,
  //         ?,
  //         ?,
  //         ?,
  //         ?,
  //         ?,
  //         ?,
  //         ?,
  //         ?,
  //         ?,
  //         ?,
  //         ?,
  //         NOW(),
  //         NOW()
  //       )
  //       `,
  //       [
  //         data.org_name,

  //         data.org_img_name ??
  //           null,

  //         data.org_legal_name ??
  //           null,

  //         data.org_registration_number ??
  //           null,

  //         data.org_gst_number ??
  //           null,

  //         data.org_email ??
  //           null,

  //         data.org_phone ??
  //           null,

  //         data.org_address_line1 ??
  //           null,

  //         data.org_address_line2 ??
  //           null,

  //         data.org_city ??
  //           null,

  //         data.org_state ??
  //           null,

  //         data.org_country ??
  //           null,

  //         data.org_pincode ??
  //           null,

  //         slug,

  //         data.org_status ??
  //           "active",

  //         data.org_timezone ??
  //           "Asia/Kolkata",
  //       ],
  //     )

  //   return result.insertId
  // },
async create(
  conn: PoolConnection,
  data: CreateOrganizationInput,
  slug: string,
  maxUsers: number,
  maxTemples: number,
) {
  const [result] =
    await conn.execute<ResultSetHeader>(
      `
      INSERT INTO organizations (
        org_name,
        org_img_name,
        org_legal_name,
        org_registration_number,
        org_gst_number,
        org_email,
        org_phone,
        org_address_line1,
        org_address_line2,
        org_city,
        org_state,
        org_country,
        org_pincode,
        org_slug,
        org_status,
        org_timezone,
        org_default_users,
        org_default_temples,
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
        data.org_name,

        data.org_img_name ??
          null,

        data.org_legal_name ??
          null,

        data.org_registration_number ??
          null,

        data.org_gst_number ??
          null,

        data.org_email ??
          null,

        data.org_phone ??
          null,

        data.org_address_line1 ??
          null,

        data.org_address_line2 ??
          null,

        data.org_city ??
          null,

        data.org_state ??
          null,

        data.org_country ??
          null,

        data.org_pincode ??
          null,

        slug,

        data.org_status ??
          "active",

        data.org_timezone ??
          "Asia/Kolkata",

        maxUsers,

        maxTemples,
      ],
    )

  return result.insertId
},
  // ============================================================
  // UPDATE ORGANIZATION
  // ============================================================

  // async update(
  //   conn: PoolConnection,
  //   id: number,
  //   data: UpdateOrganizationInput,
  //   slug?: string,
  // ) {
  //   const fields: string[] = []
  //   const values: unknown[] = []

  //   const add = (
  //     field: string,
  //     value: unknown,
  //   ) => {
  //     if (value !== undefined) {
  //       fields.push(
  //         `${field} = ?`,
  //       )

  //       values.push(value)
  //     }
  //   }

  //   add(
  //     "org_name",
  //     data.org_name,
  //   )

  //   add(
  //     "org_img_name",
  //     data.org_img_name,
  //   )

  //   add(
  //     "org_legal_name",
  //     data.org_legal_name,
  //   )

  //   add(
  //     "org_registration_number",
  //     data.org_registration_number,
  //   )

  //   add(
  //     "org_gst_number",
  //     data.org_gst_number,
  //   )

  //   add(
  //     "org_email",
  //     data.org_email,
  //   )

  //   add(
  //     "org_phone",
  //     data.org_phone,
  //   )

  //   add(
  //     "org_address_line1",
  //     data.org_address_line1,
  //   )

  //   add(
  //     "org_address_line2",
  //     data.org_address_line2,
  //   )

  //   add(
  //     "org_city",
  //     data.org_city,
  //   )

  //   add(
  //     "org_state",
  //     data.org_state,
  //   )

  //   add(
  //     "org_country",
  //     data.org_country,
  //   )

  //   add(
  //     "org_pincode",
  //     data.org_pincode,
  //   )

  //   add(
  //     "org_status",
  //     data.org_status,
  //   )

  //   add(
  //     "org_timezone",
  //     data.org_timezone,
  //   )

  //   // Update slug only when provided
  //   if (slug !== undefined) {
  //     add(
  //       "org_slug",
  //       slug,
  //     )
  //   }

  //   // Nothing to update
  //   if (fields.length === 0) {
  //     return false
  //   }

  //   values.push(id)

  //   const [result] =
  //     await conn.execute<
  //       ResultSetHeader
  //     >(
  //       `
  //       UPDATE organizations
  //       SET
  //         ${fields.join(", ")},
  //         updated_at = NOW()
  //       WHERE id = ?
  //         AND deleted_at IS NULL
  //       `,
  //       values,
  //     )

  //   return (
  //     result.affectedRows > 0
  //   )
  // },



async update(
  conn: PoolConnection,
  id: number,
  data: UpdateOrganizationInput,
  slug?: string,
) {
  const fields: string[] = []

  const values: Array<
    string | number | boolean | null
  > = []

  const add = (
    field: string,
    value:
      | string
      | number
      | boolean
      | null
      | undefined,
  ) => {
    if (value !== undefined) {
      fields.push(`${field} = ?`)
      values.push(value)
    }
  }

  add(
    "org_name",
    data.org_name,
  )

  add(
    "org_img_name",
    data.org_img_name,
  )

  add(
    "org_legal_name",
    data.org_legal_name,
  )

  add(
    "org_registration_number",
    data.org_registration_number,
  )

  add(
    "org_gst_number",
    data.org_gst_number,
  )

  add(
    "org_email",
    data.org_email,
  )

  add(
    "org_phone",
    data.org_phone,
  )

  add(
    "org_address_line1",
    data.org_address_line1,
  )

  add(
    "org_address_line2",
    data.org_address_line2,
  )

  add(
    "org_city",
    data.org_city,
  )

  add(
    "org_state",
    data.org_state,
  )

  add(
    "org_country",
    data.org_country,
  )

  add(
    "org_pincode",
    data.org_pincode,
  )

  add(
    "org_status",
    data.org_status,
  )

  add(
    "org_timezone",
    data.org_timezone,
  )

  // Update slug only when provided
  if (slug !== undefined) {
    add(
      "org_slug",
      slug,
    )
  }

  // Nothing to update
  if (fields.length === 0) {
    return false
  }

  values.push(id)

  const [result] =
    await conn.execute<ResultSetHeader>(
      `
      UPDATE organizations
      SET
        ${fields.join(", ")},
        updated_at = NOW()
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      values,
    )

  return result.affectedRows > 0
},

  // ============================================================
  // SOFT DELETE ORGANIZATION
  // ============================================================

  async remove(
    conn: PoolConnection,
    id: number,
  ) {
    const [result] =
      await conn.execute<
        ResultSetHeader
      >(
        `
        UPDATE organizations
        SET
          deleted_at = NOW(),
          updated_at = NOW()
        WHERE id = ?
          AND deleted_at IS NULL
        `,
        [id],
      )

    return (
      result.affectedRows > 0
    )
  },
}