


import { randomUUID } from "node:crypto";
import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

import { generateCode } from "../../../utils/generateCode";
import type {
  CreateTokenPayload,
  Token,
  TokenListQuery,
  TokenRepositoryListResult,
  UpdateTokenPayload,
} from "../tokenTypes";
import { TokenDuplicateError } from "../validations/tokenErrors";

interface TokenRow extends Token, RowDataPacket {}

interface CountRow extends RowDataPacket {
  total: number;
}

type SqlValue = string | number | null | Date;

/**
 * All displayed names are selected from their related tables.
 * temp_name is the temple name column in the current schema.
 * seva_name and deity_name are fetched from their respective tables.
 */
// const SELECT_FIELDS = `
//   t.id,
//   t.organization_id,
//   t.temple_id,
//   tm.temp_name AS temple_name,
//   t.token_code,
//   t.token_name,
//   t.token_description,
//   t.seva_id,
//   s.seva_name,
//   s.seva_amount,
//   s.seva_gst_percent,
//   t.deity_id,
//   d.deity_name,
//   t.token_display_order,
//   t.token_status,
//   t.created_at,
//   t.updated_at
// `;

// const FROM_JOIN = `
//   FROM tokens t

//   LEFT JOIN temples tm
//     ON tm.id = t.temple_id
//     AND tm.organization_id = t.organization_id
//     AND tm.deleted_at IS NULL

//   LEFT JOIN sevas s
//     ON s.id = t.seva_id
//     AND s.organization_id = t.organization_id
//     AND s.temple_id = t.temple_id

//   LEFT JOIN deities d
//     ON d.id = t.deity_id
//     AND d.organization_id = t.organization_id
//     AND d.temple_id = t.temple_id
// `;
const SELECT_FIELDS = `
  t.id,
  t.organization_id,
  t.temple_id,
  tm.temp_name AS temple_name,
  t.token_code,
  t.token_name,

 t.max_limit AS max_limit,

  t.token_description,
  t.seva_id,
  s.seva_name,
  s.seva_amount,
  s.seva_gst_percent,
  t.deity_id,
  d.deity_name,
  t.token_display_order,
  t.token_status,

  COALESCE(issue_summary.total_issued, 0) AS total_issued,

  CASE
    WHEN t.max_limit IS NULL THEN NULL
    ELSE GREATEST(
      t.max_limit - COALESCE(issue_summary.total_issued, 0),
      0
    )
  END AS token_remaining_tokens,

  t.created_at,
  t.updated_at
`;

const FROM_JOIN = `
  FROM tokens t

  LEFT JOIN temples tm
    ON tm.id = t.temple_id
    AND tm.organization_id = t.organization_id
    AND tm.deleted_at IS NULL

  LEFT JOIN sevas s
    ON s.id = t.seva_id
    AND s.organization_id = t.organization_id
    AND s.temple_id = t.temple_id

  LEFT JOIN deities d
    ON d.id = t.deity_id
    AND d.organization_id = t.organization_id
    AND d.temple_id = t.temple_id

  LEFT JOIN (
    SELECT
      organization_id,
      temple_id,
      token_id,
      SUM(token_quantity) AS total_issued
    FROM issued_tokens
    WHERE token_status = 'completed'
    GROUP BY organization_id, temple_id, token_id
  ) issue_summary
    ON issue_summary.organization_id = t.organization_id
    AND issue_summary.temple_id = t.temple_id
    AND issue_summary.token_id = t.id
`;
async function assertTempleBelongsToOrganization(
  connection: PoolConnection,
  organizationId: number,
  templeId: number,
): Promise<void> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    `SELECT id
     FROM temples
     WHERE id = ?
       AND organization_id = ?
       AND deleted_at IS NULL
     LIMIT 1`,
    [templeId, organizationId],
  );

  if (rows.length === 0) {
    throw new Error("Temple not found");
  }
}

/**
 * Ensure selected Seva and Deity belong to the token's organization
 * and temple. Null/undefined means no related record was selected.
 */
async function assertRelatedRecordsBelongToTemple(
  connection: PoolConnection,
  organizationId: number,
  templeId: number,
  sevaId: number | null | undefined,
  deityId: number | null | undefined,
): Promise<void> {
  if (sevaId != null) {
    const [sevas] = await connection.execute<RowDataPacket[]>(
      `SELECT id
       FROM sevas
       WHERE id = ?
         AND organization_id = ?
         AND temple_id = ?
       LIMIT 1`,
      [sevaId, organizationId, templeId],
    );

    if (sevas.length === 0) {
      throw new Error(
        "Selected Seva does not belong to this temple",
      );
    }
  }

  if (deityId != null) {
    const [deities] = await connection.execute<RowDataPacket[]>(
      `SELECT id
       FROM deities
       WHERE id = ?
         AND organization_id = ?
         AND temple_id = ?
       LIMIT 1`,
      [deityId, organizationId, templeId],
    );

    if (deities.length === 0) {
      throw new Error(
        "Selected Deity does not belong to this temple",
      );
    }
  }
}

async function assertTokenNameUnique(
  connection: PoolConnection,
  organizationId: number,
  templeId: number,
  name: string,
  excludeId?: number,
): Promise<void> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    `SELECT id
     FROM tokens
     WHERE organization_id = ?
       AND temple_id = ?
       AND LOWER(TRIM(token_name)) = LOWER(TRIM(?))
       ${excludeId !== undefined ? "AND id <> ?" : ""}
     LIMIT 1`,
    excludeId !== undefined
      ? [organizationId, templeId, name, excludeId]
      : [organizationId, templeId, name],
  );

  if (rows.length > 0) {
    throw new TokenDuplicateError("token_name");
  }
}

export async function createToken(
  connection: PoolConnection,
  organizationId: number,
  data: CreateTokenPayload,
): Promise<number> {
  if (data.temple_id === undefined) {
    throw new Error("Temple ID is required");
  }

  const templeId = data.temple_id;

  await assertTempleBelongsToOrganization(
    connection,
    organizationId,
    templeId,
  );

  await assertRelatedRecordsBelongToTemple(
    connection,
    organizationId,
    templeId,
    data.seva_id,
    data.deity_id,
  );

  await assertTokenNameUnique(
    connection,
    organizationId,
    templeId,
    data.token_name,
  );

  const temporaryCode = `PENDING-${randomUUID()}`;

  const [result] = await connection.execute<ResultSetHeader>(
    `INSERT INTO tokens (
       organization_id,
       temple_id,
       token_code,
       token_name,
        max_limit,
       token_description,
       seva_id,
       deity_id,
       token_display_order,
       token_status
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
    [
      organizationId,
      templeId,
      temporaryCode,
      data.token_name,
     data.max_limit ?? null,
      data.token_description ?? null,
      data.seva_id ?? null,
      data.deity_id ?? null,
      data.token_display_order ?? 1,
      data.token_status ?? "active",
    ],
  );

  const id = result.insertId;

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Failed to generate Token ID");
  }

  const tokenCode = generateCode(data.token_name, templeId, id);

  const [updated] = await connection.execute<ResultSetHeader>(
    `UPDATE tokens
     SET token_code = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?
       AND organization_id = ?
       AND temple_id = ?`,
    [tokenCode, id, organizationId, templeId],
  );

  if (updated.affectedRows !== 1) {
    throw new Error("Failed to generate Token code");
  }

  return id;
}

export async function findAllTokens(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  query: TokenListQuery,
): Promise<TokenRepositoryListResult> {
  const conditions = ["t.organization_id = ?",  "t.deleted_at IS NULL",];
  const params: SqlValue[] = [organizationId];

  if (userTempleId !== null) {
    conditions.push("t.temple_id = ?");
    params.push(userTempleId);
  } else if (query.temple_id !== undefined) {
    conditions.push("t.temple_id = ?");
    params.push(query.temple_id);
  }

  if (query.search?.trim()) {
    conditions.push(
      "(t.token_name LIKE ? OR t.token_code LIKE ?)",
    );

    const search = `%${query.search.trim()}%`;
    params.push(search, search);
  }

  if (query.token_status) {
    conditions.push("t.token_status = ?");
    params.push(query.token_status);
  }

  const where = conditions.join(" AND ");

  const [countRows] = await connection.execute<CountRow[]>(
    `SELECT COUNT(*) AS total
     FROM tokens t
     WHERE ${where}`,
    params,
  );

  const total = Number(countRows[0]?.total ?? 0);
  const offset = (query.page - 1) * query.limit;

  const [rows] = await connection.execute<TokenRow[]>(
    `SELECT ${SELECT_FIELDS}
   ${FROM_JOIN}
   WHERE ${where}
    
   ORDER BY t.token_display_order ASC, t.id DESC
   LIMIT ? OFFSET ?`,
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

export async function findTokenById(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
): Promise<Token | null> {
  const conditions = [
    "t.id = ?",
    "t.organization_id = ?",
  ];

  const params: SqlValue[] = [id, organizationId];

  if (userTempleId !== null) {
    conditions.push("t.temple_id = ?");
    params.push(userTempleId);
  }

  const [rows] = await connection.execute<TokenRow[]>(
    `SELECT ${SELECT_FIELDS}
     ${FROM_JOIN}
     WHERE ${conditions.join(" AND ")}
     LIMIT 1`,
    params,
  );

  return rows[0] ?? null;
}

export async function updateToken(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
  data: UpdateTokenPayload,
): Promise<boolean> {
  const current = await findTokenById(
    connection,
    organizationId,
    userTempleId,
    id,
  );

  if (!current) {
    return false;
  }

  const templeId =
    userTempleId ?? data.temple_id ?? current.temple_id;

  const name = data.token_name ?? current.token_name;

  await assertTempleBelongsToOrganization(
    connection,
    organizationId,
    templeId,
  );

  await assertRelatedRecordsBelongToTemple(
    connection,
    organizationId,
    templeId,
    data.seva_id !== undefined
      ? data.seva_id
      : current.seva_id,
    data.deity_id !== undefined
      ? data.deity_id
      : current.deity_id,
  );

  await assertTokenNameUnique(
    connection,
    organizationId,
    templeId,
    name,
    id,
  );

  // const allowedFields: Array<keyof UpdateTokenPayload> = [
  //   "token_name",
  //   "token_description",
  //   "seva_id",
  //   "deity_id",
  //   "token_display_order",
  //   "token_status",
  // ];
  const allowedFields: Array<keyof UpdateTokenPayload> = [
  "token_name",
  "max_limit",
  "token_description",
  "seva_id",
  "deity_id",
  "token_display_order",
  "token_status",
];

  const fields: string[] = [];
  const values: SqlValue[] = [];

  if (templeId !== current.temple_id) {
    fields.push("temple_id = ?");
    values.push(templeId);
  }

  for (const field of allowedFields) {
    const value = data[field];

    if (value !== undefined) {
      fields.push(`${field} = ?`);

      values.push(
        field === "token_description" && value === ""
          ? null
          : (value as SqlValue),
      );
    }
  }

  if (fields.length === 0) {
    return true;
  }

  const [result] = await connection.execute<ResultSetHeader>(
    `UPDATE tokens
     SET ${fields.join(", ")},
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?
       AND organization_id = ?
       ${userTempleId !== null ? "AND temple_id = ?" : ""}`,
    userTempleId !== null
      ? [...values, id, organizationId, userTempleId]
      : [...values, id, organizationId],
  );

  return result.affectedRows > 0;
}

export async function deactivateToken(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
): Promise<boolean> {
  const [result] = await connection.execute<ResultSetHeader>(
    `UPDATE tokens
     SET deleted_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
           
     WHERE id = ?
       AND organization_id = ?
       ${userTempleId !== null ? "AND temple_id = ?" : ""}`,
    userTempleId !== null
      ? [id, organizationId, userTempleId]
      : [id, organizationId],
  );

  return result.affectedRows > 0;
}
