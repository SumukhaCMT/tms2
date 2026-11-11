




import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

import pool from "../../../config/database";

import type {
  CreateTrusteePayload,
  Trustee,
  TrusteeListQuery,
  UpdateTrusteePayload,
} from "../trusteeTypes";

interface TrusteeRow extends RowDataPacket {
  id: number;
  organization_id: number;
  temple_id: number | null;
  trustee_name: string;
  trustee_email: string | null;
  trustee_phone: string | null;
  trustee_position: string | null;
  trustee_display_order: number;
  trustee_address_line1: string | null;
  trustee_address_line2: string | null;
  trustee_city: string | null;
  trustee_state: string | null;
  trustee_country: string;
  trustee_pincode: string | null;
  trustee_status: "active" | "inactive" | "former";
  start_date: string | null;
  end_date: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

type MySqlValue = string | number | boolean | null | Date | Buffer;

/**
 * Database columns are aliased to start_date and end_date
 * to keep the existing API response field names unchanged.
 */
const trusteeSelect = `
  SELECT
    id,
    organization_id,
    temple_id,
    trustee_name,
    trustee_email,
    trustee_phone,
    trustee_position,
    trustee_display_order,
    trustee_address_line1,
    trustee_address_line2,
    trustee_city,
    trustee_state,
    trustee_country,
    trustee_pincode,
    trustee_status,
    DATE_FORMAT(trustee_start_date, '%Y-%m-%d') AS start_date,
    DATE_FORMAT(trustee_end_date, '%Y-%m-%d') AS end_date,
    created_at,
    updated_at
  FROM trustees
`;

export async function findTrustees(
  organizationId: number,
  userTempleId: number | null,
  query: TrusteeListQuery,
) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(query.limit) || 10),
  );
  const offset = (page - 1) * limit;

  const conditions: string[] = [
    "organization_id = ?",
    "deleted_at IS NULL",
  ];

  const params: MySqlValue[] = [organizationId];

  // A temple-scoped user can only access their own temple.
  if (userTempleId !== null) {
    conditions.push("temple_id = ?");
    params.push(userTempleId);
  } else if (query.temple_id !== undefined) {
    conditions.push("temple_id = ?");
    params.push(query.temple_id);
  }

  if (query.status !== undefined) {
    conditions.push("trustee_status = ?");
    params.push(query.status);
  }

  if (query.search?.trim()) {
    conditions.push(`
      (
        trustee_name LIKE ?
        OR trustee_email LIKE ?
        OR trustee_phone LIKE ?
        OR trustee_position LIKE ?
      )
    `);

    const search = `%${query.search.trim()}%`;

    params.push(search, search, search, search);
  }

  const whereClause = conditions.join(" AND ");

  const [countRows] = await pool.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS total
      FROM trustees
      WHERE ${whereClause}
    `,
    params,
  );

  const total = Number(countRows[0]?.total ?? 0);

  const [rows] = await pool.execute<TrusteeRow[]>(
    `
      ${trusteeSelect}
      WHERE ${whereClause}
      ORDER BY trustee_display_order ASC, id DESC
      LIMIT ? OFFSET ?
    `,
    [...params, limit, offset],
  );

  return {
    data: rows as Trustee[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function findTrusteeById(
  organizationId: number,
  userTempleId: number | null,
  id: number,
): Promise<Trustee | null> {
  const conditions: string[] = [
    "id = ?",
    "organization_id = ?",
    "deleted_at IS NULL",
  ];

  const params: MySqlValue[] = [id, organizationId];

  if (userTempleId !== null) {
    conditions.push("temple_id = ?");
    params.push(userTempleId);
  }

  const [rows] = await pool.execute<TrusteeRow[]>(
    `
      ${trusteeSelect}
      WHERE ${conditions.join(" AND ")}
      LIMIT 1
    `,
    params,
  );

  return rows[0] ? (rows[0] as Trustee) : null;
}

export async function createTrustee(
  organizationId: number,
  payload: CreateTrusteePayload,
): Promise<number> {
  const sql = `
    INSERT INTO trustees (
      organization_id,
      temple_id,
      trustee_name,
      trustee_email,
      trustee_phone,
      trustee_position,
      trustee_display_order,
      trustee_address_line1,
      trustee_address_line2,
      trustee_city,
      trustee_state,
      trustee_country,
      trustee_pincode,
      trustee_status,
      trustee_start_date,
      trustee_end_date
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values: MySqlValue[] = [
    organizationId,
    payload.temple_id ?? null,
    payload.trustee_name,
    payload.trustee_email || null,
    payload.trustee_phone || null,
    payload.trustee_position || null,
    payload.trustee_display_order ?? 1,
    payload.trustee_address_line1 || null,
    payload.trustee_address_line2 || null,
    payload.trustee_city || null,
    payload.trustee_state || null,
    payload.trustee_country || "India",
    payload.trustee_pincode || null,
    payload.trustee_status ?? "active",
    payload.start_date ?? null,
    payload.end_date ?? null,
  ];

  const [result] = await pool.execute<ResultSetHeader>(
    sql,
    values,
  );

  if (!result.insertId) {
    throw new Error("Failed to create trustee");
  }

  return result.insertId;
}

export async function updateTrustee(
  organizationId: number,
  userTempleId: number | null,
  id: number,
  payload: UpdateTrusteePayload,
): Promise<boolean> {
  const allowedFields: Record<
    keyof UpdateTrusteePayload,
    string
  > = {
    temple_id: "temple_id",
    trustee_name: "trustee_name",
    trustee_email: "trustee_email",
    trustee_phone: "trustee_phone",
    trustee_position: "trustee_position",
    trustee_display_order: "trustee_display_order",
    trustee_address_line1: "trustee_address_line1",
    trustee_address_line2: "trustee_address_line2",
    trustee_city: "trustee_city",
    trustee_state: "trustee_state",
    trustee_country: "trustee_country",
    trustee_pincode: "trustee_pincode",
    trustee_status: "trustee_status",
    start_date: "trustee_start_date",
    end_date: "trustee_end_date",
  };

  const entries = (
    Object.entries(payload) as [
      keyof UpdateTrusteePayload,
      UpdateTrusteePayload[keyof UpdateTrusteePayload],
    ][]
  ).filter(
    ([key, value]) =>
      value !== undefined && allowedFields[key] !== undefined,
  );

  if (entries.length === 0) {
    return false;
  }

  const fields: string[] = [];
  const values: MySqlValue[] = [];

  for (const [key, value] of entries) {
    // Column names come only from the explicit allowlist above.
    fields.push(`${allowedFields[key]} = ?`);

    if (
      key === "trustee_email" ||
      key === "trustee_phone" ||
      key === "trustee_position" ||
      key === "trustee_address_line1" ||
      key === "trustee_address_line2" ||
      key === "trustee_city" ||
      key === "trustee_state" ||
      key === "trustee_pincode"
    ) {
      values.push(
        value == null || value === "" ? null : String(value),
      );
    } else {
      values.push(value as MySqlValue);
    }
  }

  const conditions: string[] = [
    "id = ?",
    "organization_id = ?",
    "deleted_at IS NULL",
  ];

  const whereParams: MySqlValue[] = [id, organizationId];

  if (userTempleId !== null) {
    conditions.push("temple_id = ?");
    whereParams.push(userTempleId);
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `
      UPDATE trustees
      SET
        ${fields.join(", ")},
        updated_at = CURRENT_TIMESTAMP
      WHERE ${conditions.join(" AND ")}
    `,
    [...values, ...whereParams],
  );

  return result.affectedRows > 0;
}

export async function softDeleteTrustee(
  organizationId: number,
  userTempleId: number | null,
  id: number,
): Promise<boolean> {
  const conditions: string[] = [
    "id = ?",
    "organization_id = ?",
    "deleted_at IS NULL",
  ];

  const params: MySqlValue[] = [id, organizationId];

  if (userTempleId !== null) {
    conditions.push("temple_id = ?");
    params.push(userTempleId);
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `
      UPDATE trustees
      SET
        deleted_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE ${conditions.join(" AND ")}
    `,
    params,
  );

  return result.affectedRows > 0;
}


export interface TrusteeContact {
  name: string
  designation: string | null
  phone: string | null
  email: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
}

export const searchTrusteeContacts = async (
  scope: { organization_id: number | null; temple_id: number | null },
  query: string,
): Promise<TrusteeContact[]> => {
  if (!scope.organization_id) return [];

  const [rows] = await pool.execute<(RowDataPacket & TrusteeContact)[]>(
    `
      SELECT
        trustee_name AS name,
        COALESCE(NULLIF(trustee_position, ''), 'Trustee') AS designation,
        trustee_phone AS phone,
        trustee_email AS email,
        trustee_address_line1 AS address_line1,
        trustee_address_line2 AS address_line2,
        trustee_city AS city
      FROM trustees
      WHERE deleted_at IS NULL
        AND trustee_status = 'active'
        AND trustee_name LIKE ?
        AND organization_id = ?
        ${scope.temple_id ? "AND (temple_id = ? OR temple_id IS NULL)" : ""}
      ORDER BY trustee_name ASC
      LIMIT 10
    `,
    [`%${query}%`, scope.organization_id, ...(scope.temple_id ? [scope.temple_id] : [])],
  );

  return rows;
};
