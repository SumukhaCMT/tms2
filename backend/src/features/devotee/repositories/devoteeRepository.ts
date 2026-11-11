

import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

import type {
  Devotee,
  DevoteeListQuery,
  DevoteeListResult,
  UpdateDevoteePayload,
} from "../devoteeTypes";

interface DevoteeRow extends Devotee, RowDataPacket {}

interface CountRow extends RowDataPacket {
  total: number;
}

type SqlValue = string | number | null | Date;

const SELECT_FIELDS = `
  id,
  organization_id,
  temple_id,
  devotee_name,
  devotee_email,
  devotee_phone,
  devotee_gender,
  devotee_dob,
  devotee_gotra,
  devotee_rashi,
  devotee_nakshatra,
  devotee_remark,
  devotee_address_line1,
  devotee_address_line2,
  devotee_city,
  devotee_state,
  devotee_country,
  devotee_pincode,
  devotee_status,
  created_at,
  updated_at,
  deleted_at
`;

/**
 * GET ALL DEVOTEES
 *
 * Supports:
 * - Organization filter
 * - Temple filter
 * - Name search
 * - Email search
 * - Phone search
 * - Status filter
 * - Pagination
 */
export async function findAllDevotees(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  query: DevoteeListQuery,
): Promise<DevoteeListResult> {
  const conditions: string[] = [
    "organization_id = ?",
    "deleted_at IS NULL",
  ];

  const params: SqlValue[] = [organizationId];

  // Temple-scoped user always sees their own temple.
  if (userTempleId !== null) {
    conditions.push("temple_id = ?");
    params.push(userTempleId);
  } else if (query.temple_id !== undefined) {
    // Organization-scoped user can filter by temple.
    conditions.push("temple_id = ?");
    params.push(query.temple_id);
  }

  if (query.status) {
    conditions.push("devotee_status = ?");
    params.push(query.status);
  }

  if (query.search?.trim()) {
    const search = `%${query.search.trim()}%`;

    conditions.push(`
      (
        devotee_name LIKE ?
        OR devotee_email LIKE ?
        OR devotee_phone LIKE ?
      )
    `);

    params.push(search, search, search);
  }

  const where = conditions.join(" AND ");

  // Total records
  const [countRows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS total
      FROM devotees
      WHERE ${where}
    `,
    params,
  );

  const total = Number(countRows[0]?.total ?? 0);

  const offset = (query.page - 1) * query.limit;

  // Paginated records
  const [rows] = await connection.execute<DevoteeRow[]>(
    `
      SELECT ${SELECT_FIELDS}
      FROM devotees
      WHERE ${where}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `,
    [...params, query.limit, offset],
  );

  return {
    data: rows,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

/**
 * GET DEVOTEE BY ID
 */
export async function findDevoteeById(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
): Promise<Devotee | null> {
  const conditions: string[] = [
    "id = ?",
    "organization_id = ?",
    "deleted_at IS NULL",
  ];

  const params: SqlValue[] = [id, organizationId];

  if (userTempleId !== null) {
    conditions.push("temple_id = ?");
    params.push(userTempleId);
  }

  const [rows] = await connection.execute<DevoteeRow[]>(
    `
      SELECT ${SELECT_FIELDS}
      FROM devotees
      WHERE ${conditions.join(" AND ")}
      LIMIT 1
    `,
    params,
  );

  return rows[0] ?? null;
}

/**
 * CHECK TEMPLE BELONGS TO ORGANIZATION
 */
export async function assertTempleBelongsToOrganization(
  connection: PoolConnection,
  organizationId: number,
  templeId: number,
): Promise<void> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    `
      SELECT id
      FROM temples
      WHERE id = ?
        AND organization_id = ?
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [templeId, organizationId],
  );

  if (rows.length === 0) {
    throw new Error("Temple not found");
  }
}

/**
 * UPDATE DEVOTEE
 */
export async function updateDevotee(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
  data: UpdateDevoteePayload,
): Promise<boolean> {
  const allowedFields: Array<keyof UpdateDevoteePayload> = [
    "temple_id",
    "devotee_name",
    "devotee_email",
    "devotee_phone",
    "devotee_gender",
    "devotee_dob",
    "devotee_gotra",
    "devotee_rashi",
    "devotee_nakshatra",
    "devotee_remark",
    "devotee_address_line1",
    "devotee_address_line2",
    "devotee_city",
    "devotee_state",
    "devotee_country",
    "devotee_pincode",
    "devotee_status",
  ];

  const fields: string[] = [];
  const values: SqlValue[] = [];

  for (const field of allowedFields) {
    const value = data[field];

    if (value !== undefined) {
      fields.push(`${field} = ?`);
      values.push(value as SqlValue);
    }
  }

  if (fields.length === 0) {
    return false;
  }

  const conditions: string[] = [
    "id = ?",
    "organization_id = ?",
    "deleted_at IS NULL",
  ];

  const whereValues: SqlValue[] = [id, organizationId];

  if (userTempleId !== null) {
    conditions.push("temple_id = ?");
    whereValues.push(userTempleId);
  }

  const [result] = await connection.execute<ResultSetHeader>(
    `
      UPDATE devotees
      SET ${fields.join(", ")},
          updated_at = CURRENT_TIMESTAMP
      WHERE ${conditions.join(" AND ")}
    `,
    [...values, ...whereValues],
  );

  return result.affectedRows > 0;
}

export async function deleteDevotee(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
): Promise<boolean> {
  const conditions: string[] = [
    "id = ?",
    "organization_id = ?",
    "deleted_at IS NULL",
  ];

  const params: SqlValue[] = [id, organizationId];

  if (userTempleId !== null) {
    conditions.push("temple_id = ?");
    params.push(userTempleId);
  }

  const [result] = await connection.execute<ResultSetHeader>(
    `
      UPDATE devotees
      SET
        deleted_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE ${conditions.join(" AND ")}
    `,
    params,
  );

  return result.affectedRows > 0;
}