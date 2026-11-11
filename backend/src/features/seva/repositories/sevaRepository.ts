


import { randomUUID } from "node:crypto";

import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

import { generateCode } from "../../../utils/generateCode";

import type {
  CreateSevaPayload,
  Seva,
  SevaListQuery,
  SevaListResult,
  UpdateSevaPayload,
} from "../sevaTypes";

import { SevaDuplicateError } from "../validations/sevaErrors";

interface SevaRow extends Seva, RowDataPacket {}

interface CountRow extends RowDataPacket {
  total: number;
}

type SqlValue = string | number | null | Date;

// const SELECT_FIELDS = `
//   id,
//   organization_id,
//   temple_id,
//   seva_name,
//   seva_code,
//   seva_amount,
//   seva_gst_percent,
//   seva_is_default,
//   seva_display_order,
//   seva_remark,
//   seva_status,
//   created_at,
//   updated_at,
//   deleted_at,
//   deity_id,
// `;
const SELECT_FIELDS = `
  id,
  organization_id,
  temple_id,
  deity_id,
  seva_name,
  seva_code,
  seva_amount,
  seva_gst_percent,
  seva_is_default,
  seva_display_order,
  seva_remark,
  seva_status,
  created_at,
  updated_at,
  deleted_at
`;
async function assertDeityBelongsToTemple(
  connection: PoolConnection,
  organizationId: number,
  templeId: number,
  deityId: number | null | undefined,
): Promise<void> {
  // Deity is optional.
  if (deityId === null || deityId === undefined) {
    return;
  }

  const [rows] = await connection.execute<RowDataPacket[]>(
    `
      SELECT id
      FROM deities
      WHERE id = ?
        AND organization_id = ?
        AND temple_id = ?
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [deityId, organizationId, templeId],
  );

  if (rows.length === 0) {
    throw new Error("Selected deity does not belong to this temple.");
  }
}
async function assertTempleBelongsToOrganization(
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

async function assertSevaNameUnique(
  connection: PoolConnection,
  organizationId: number,
  templeId: number,
  name: string,
  excludeId?: number,
): Promise<void> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    `
      SELECT id
      FROM sevas
      WHERE organization_id = ?
        AND temple_id = ?
        AND LOWER(TRIM(seva_name)) = LOWER(TRIM(?))
        AND deleted_at IS NULL
        ${excludeId !== undefined ? "AND id <> ?" : ""}
      LIMIT 1
    `,
    excludeId !== undefined
      ? [organizationId, templeId, name, excludeId]
      : [organizationId, templeId, name],
  );

  if (rows.length > 0) {
    throw new SevaDuplicateError("seva_name");
  }
}

/**
 * CREATE
 */
export async function createSeva(
  connection: PoolConnection,
  organizationId: number,
  data: CreateSevaPayload,
): Promise<number> {
  await assertTempleBelongsToOrganization(
    connection,
    organizationId,
    data.temple_id,
  );

  await assertSevaNameUnique(
    connection,
    organizationId,
    data.temple_id,
    data.seva_name,
  );

  const temporaryCode = `PENDING-${randomUUID()}`;

  const [result] = await connection.execute<ResultSetHeader>(
    `
      INSERT INTO sevas (
        organization_id,
        temple_id,
        seva_name,
        seva_code,
        seva_amount,
        seva_gst_percent,
        seva_is_default,
        seva_display_order,
        seva_remark,
        seva_status,
        deity_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      organizationId,
      data.temple_id,
      data.seva_name,
      temporaryCode,
      data.seva_amount,
      data.seva_gst_percent ?? 0,
      data.seva_is_default ?? "no",
      data.seva_display_order ?? 1,
      data.seva_remark ?? null,
      data.seva_status ?? "active",
      data.deity_id ?? null
    ],
  );

  const id = result.insertId;

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Failed to generate Seva ID");
  }

  const code = generateCode(
    data.seva_name,
    data.temple_id,
    id,
  );

  const [updated] = await connection.execute<ResultSetHeader>(
    `
      UPDATE sevas
      SET seva_code = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND organization_id = ?
        AND temple_id = ?
        AND deleted_at IS NULL
    `,
    [code, id, organizationId, data.temple_id],
  );

  if (updated.affectedRows !== 1) {
    throw new Error("Failed to generate Seva code");
  }

  return id;
}

/**
 * LIST
 *
 * A non-null userTempleId overrides the query's temple filter.
 * A null userTempleId allows an optional query.temple_id.
 */
export async function findAllSevas(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  query: SevaListQuery,
): Promise<SevaListResult> {
  const conditions: string[] = [
    "organization_id = ?",
    "deleted_at IS NULL",
  ];

  const params: SqlValue[] = [organizationId];

  if (userTempleId !== null) {
    conditions.push("temple_id = ?");
    params.push(userTempleId);
  } else if (query.temple_id !== undefined) {
    conditions.push("temple_id = ?");
    params.push(query.temple_id);
  }

  if (query.search?.trim()) {
    conditions.push(
      "(seva_name LIKE ? OR seva_code LIKE ?)",
    );

    const search = `%${query.search.trim()}%`;
    params.push(search, search);
  }

  const where = conditions.join(" AND ");

  const [countRows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS total
      FROM sevas
      WHERE ${where}
    `,
    params,
  );

  const total = Number(countRows[0]?.total ?? 0);
  const offset = (query.page - 1) * query.limit;

  const [rows] = await connection.execute<SevaRow[]>(
    `
      SELECT ${SELECT_FIELDS}
      FROM sevas
      WHERE ${where}
      ORDER BY seva_display_order ASC, id DESC
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
 * GET BY ID
 */
export async function findSevaById(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
): Promise<Seva | null> {
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

  const [rows] = await connection.execute<SevaRow[]>(
    `
      SELECT ${SELECT_FIELDS}
      FROM sevas
      WHERE ${conditions.join(" AND ")}
      LIMIT 1
    `,
    params,
  );

  return rows[0] ?? null;
}

/**
 * UPDATE
 */
// export async function updateSeva(
//   connection: PoolConnection,
//   organizationId: number,
//   userTempleId: number | null,
//   id: number,
//   data: UpdateSevaPayload,
// ): Promise<boolean> {
//   const current = await findSevaById(
//     connection,
//     organizationId,
//     userTempleId,
//     id,
//   );

//   if (!current) {
//     return false;
//   }

//   const templeId = data.temple_id ?? current.temple_id;
//   const name = data.seva_name ?? current.seva_name;

//   // Verify that the target temple belongs to this organization.
//   await assertTempleBelongsToOrganization(
//     connection,
//     organizationId,
//     templeId,
//   );

//   await assertSevaNameUnique(
//     connection,
//     organizationId,
//     templeId,
//     name,
//     id,
//   );

//   const allowedFields: Array<keyof UpdateSevaPayload> = [
//     "temple_id",
//     "seva_name",
//     "seva_amount",
//     "seva_gst_percent",
//     "seva_is_default",
//     "seva_display_order",
//     "seva_remark",
//     "seva_status",
//   ];

//   const fields: string[] = [];
//   const values: SqlValue[] = [];

//   for (const field of allowedFields) {
//     const value = data[field];

//     if (value !== undefined) {
//       fields.push(`${field} = ?`);

//       if (
//         field === "seva_remark" &&
//         (value === "" || value === null)
//       ) {
//         values.push(null);
//       } else {
//         values.push(value as SqlValue);
//       }
//     }
//   }

//   if (fields.length === 0) {
//     return true;
//   }

//   const conditions: string[] = [
//     "id = ?",
//     "organization_id = ?",
//     "deleted_at IS NULL",
//   ];

//   const whereValues: SqlValue[] = [id, organizationId];

//   if (userTempleId !== null) {
//     conditions.push("temple_id = ?");
//     whereValues.push(userTempleId);
//   }

//   const [result] = await connection.execute<ResultSetHeader>(
//     `
//       UPDATE sevas
//       SET ${fields.join(", ")},
//           updated_at = CURRENT_TIMESTAMP
//       WHERE ${conditions.join(" AND ")}
//     `,
//     [...values, ...whereValues],
//   );

//   return result.affectedRows > 0;
// }

export async function updateSeva(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
  data: UpdateSevaPayload,
): Promise<boolean> {
  const current = await findSevaById(
    connection,
    organizationId,
    userTempleId,
    id,
  );

  if (!current) {
    return false;
  }

  const templeId = data.temple_id ?? current.temple_id;
  const name = data.seva_name ?? current.seva_name;

  // Temple-level users cannot move a seva to another temple.
  if (
    userTempleId !== null &&
    templeId !== userTempleId
  ) {
    throw new Error("You are not allowed to change the temple.");
  }

  // Validate target temple.
  await assertTempleBelongsToOrganization(
    connection,
    organizationId,
    templeId,
  );

  // Validate unique seva name within the target temple.
  await assertSevaNameUnique(
    connection,
    organizationId,
    templeId,
    name,
    id,
  );

  // Determine deity:
  // 1. Explicit null removes the deity.
  // 2. Explicit ID updates the deity.
  // 3. Temple change without deity clears the old deity.
  // 4. Otherwise retain the existing deity.
  const templeChanged =
    Number(templeId) !== Number(current.temple_id);

  const deityId =
    data.deity_id !== undefined
      ? data.deity_id
      : templeChanged
        ? null
        : current.deity_id;

  // Validate deity only when one is selected.
  if (deityId !== null && deityId !== undefined) {
    await assertDeityBelongsToTemple(
      connection,
      organizationId,
      templeId,
      deityId,
    );
  }

  const allowedFields: Array<keyof UpdateSevaPayload> = [
    "temple_id",
    "seva_name",
    "seva_amount",
    "seva_gst_percent",
    "seva_is_default",
    "seva_display_order",
    "seva_remark",
    "seva_status",
  ];

  const fields: string[] = [];
  const values: SqlValue[] = [];

  for (const field of allowedFields) {
    const value = data[field];

    if (value !== undefined) {
      fields.push(`${field} = ?`);

      if (
        field === "seva_remark" &&
        (value === "" || value === null)
      ) {
        values.push(null);
      } else {
        values.push(value as SqlValue);
      }
    }
  }

  // Always include deity_id so it can be updated or cleared.
  fields.push("deity_id = ?");
  values.push(deityId ?? null);

  if (fields.length === 0) {
    return true;
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
      UPDATE sevas
      SET ${fields.join(", ")},
          updated_at = CURRENT_TIMESTAMP
      WHERE ${conditions.join(" AND ")}
    `,
    [...values, ...whereValues],
  );

  return result.affectedRows > 0;
}


/**
 * SOFT DELETE
 */
export async function softDeleteSeva(
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
      UPDATE sevas
      SET deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE ${conditions.join(" AND ")}
    `,
    params,
  );

  return result.affectedRows > 0;
}
