

import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

import type {
  CreateDeityInput,
  Deity,
  UpdateDeityInput,
} from "../deityTypes";

import { generateCode } from "../../../utils/generateCode";

interface DeityRow extends RowDataPacket {
  id: number;
  organization_id: number;
  temple_id: number;
  deity_name: string;
  deity_img_name: string | null;
  deity_code: string;
  deity_description: string | null;
  deity_is_default: "yes" | "no";
  deity_display_order: number;
  deity_status: "active" | "inactive";
  created_at: Date | null;
  updated_at: Date | null;
  deleted_at: Date | null;
}

const deitySelect = `
  SELECT
    d.id,
    d.organization_id,
    d.temple_id,
    d.deity_name,
    d.deity_img_name,
    d.deity_code,
    d.deity_description,
    d.deity_is_default,
    d.deity_display_order,
    d.deity_status,
    d.created_at,
    d.updated_at,
    d.deleted_at
  FROM deities d
`;

const mapDeity = (row: DeityRow): Deity => ({
  id: row.id,
  organization_id: row.organization_id,
  temple_id: row.temple_id,
  deity_name: row.deity_name,
  deity_img_name: row.deity_img_name,
  deity_code: row.deity_code,
  deity_description: row.deity_description,
  deity_is_default: row.deity_is_default,
  deity_display_order: row.deity_display_order,
  deity_status: row.deity_status,
  created_at: row.created_at,
  updated_at: row.updated_at,
  deleted_at: row.deleted_at,
});

const ensureTempleBelongsToOrganization = async (
  connection: PoolConnection,
  templeId: number,
  organizationId: number
): Promise<void> => {
  const [rows] = await connection.execute<RowDataPacket[]>(
    `
      SELECT id
      FROM temples
      WHERE id = ?
        AND organization_id = ?
      LIMIT 1
    `,
    [templeId, organizationId]
  );

  if (rows.length === 0) {
    const error = new Error(
      "The selected temple does not belong to this organization."
    ) as Error & { code?: string };

    error.code = "DEITY_INVALID_TEMPLE";
    throw error;
  }
};

/**
 * CREATE
 * Controller owns the transaction.
 * deity_code is generated automatically.
 */
export const createDeityRepository = async (
  connection: PoolConnection,
  data: CreateDeityInput
): Promise<Deity> => {
  await ensureTempleBelongsToOrganization(
    connection,
    data.temple_id,
    data.organization_id
  );

  if (data.deity_is_default === "yes") {
    await connection.execute(
      `
        UPDATE deities
        SET
          deity_is_default = 'no',
          updated_at = CURRENT_TIMESTAMP
        WHERE organization_id = ?
          AND temple_id = ?
          AND deleted_at IS NULL
          AND deity_is_default = 'yes'
      `,
      [data.organization_id, data.temple_id]
    );
  }

  /*
   * deity_code is NOT NULL in the database.
   * Insert a temporary value, then replace it with the final code.
   *
   * The temporary value uses a UUID to reduce collision risk.
   */
  const temporaryCode = `TMP-${crypto.randomUUID()}`;

  const [result] = await connection.execute<ResultSetHeader>(
    `
      INSERT INTO deities (
        organization_id,
        temple_id,
        deity_name,
        deity_img_name,
        deity_code,
        deity_description,
        deity_is_default,
        deity_display_order,
        deity_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.organization_id,
      data.temple_id,
      data.deity_name,
      data.deity_img_name ?? null,
      temporaryCode,
      data.deity_description ?? null,
      data.deity_is_default ?? "no",
      data.deity_display_order ?? 1,
      data.deity_status ?? "active",
    ]
  );

  const deityId = result.insertId;

  if (!deityId) {
    throw new Error("Failed to create deity: database ID was not returned.");
  }

  const deityCode = generateCode(
    data.deity_name,
    data.temple_id,
    deityId
  );

  const [updateResult] = await connection.execute<ResultSetHeader>(
    `
      UPDATE deities
      SET
        deity_code = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND organization_id = ?
        AND temple_id = ?
        AND deleted_at IS NULL
    `,
    [
      deityCode,
      deityId,
      data.organization_id,
      data.temple_id,
    ]
  );

  if (updateResult.affectedRows !== 1) {
    throw new Error("Failed to save the generated deity code.");
  }

  const deity = await getDeityByIdRepository(
    connection,
    deityId,
    data.organization_id
  );

  if (!deity) {
    throw new Error("Failed to retrieve the created deity.");
  }

  return deity;
};

/**
 * GET ALL
 * Returns non-deleted deities for this organization.
 */
export const getDeitiesRepository = async (
  connection: PoolConnection,
  organizationId: number
): Promise<Deity[]> => {
  const [rows] = await connection.execute<DeityRow[]>(
    `
      ${deitySelect}
      WHERE d.organization_id = ?
        AND d.deleted_at IS NULL
      ORDER BY
        d.deity_display_order ASC,
        d.id DESC
    `,
    [organizationId]
  );

  return rows.map(mapDeity);
};

/**
 * GET BY ID
 */
export const getDeityByIdRepository = async (
  connection: PoolConnection,
  id: number,
  organizationId: number
): Promise<Deity | null> => {
  const [rows] = await connection.execute<DeityRow[]>(
    `
      ${deitySelect}
      WHERE d.id = ?
        AND d.organization_id = ?
        AND d.deleted_at IS NULL
      LIMIT 1
    `,
    [id, organizationId]
  );

  return rows.length > 0 ? mapDeity(rows[0]) : null;
};

/**
 * UPDATE
 * Generated deity_code cannot be changed manually.
 */
export const updateDeityRepository = async (
  connection: PoolConnection,
  id: number,
  organizationId: number,
  data: UpdateDeityInput
): Promise<Deity | null> => {
  const existing = await getDeityByIdRepository(
    connection,
    id,
    organizationId
  );

  if (!existing) {
    return null;
  }

  const templeId = data.temple_id ?? existing.temple_id;
  const isDefault =
    data.deity_is_default ?? existing.deity_is_default;

  if (data.temple_id !== undefined) {
    await ensureTempleBelongsToOrganization(
      connection,
      templeId,
      organizationId
    );
  }

  const fields: string[] = [];
  const values: Array<string | number | null> = [];

  if (data.temple_id !== undefined) {
    fields.push("temple_id = ?");
    values.push(data.temple_id);
  }

  if (data.deity_name !== undefined) {
    fields.push("deity_name = ?");
    values.push(data.deity_name);
  }

  if (data.deity_img_name !== undefined) {
    fields.push("deity_img_name = ?");
    values.push(data.deity_img_name);
  }

  if (data.deity_description !== undefined) {
    fields.push("deity_description = ?");
    values.push(data.deity_description);
  }

  if (data.deity_is_default !== undefined) {
    fields.push("deity_is_default = ?");
    values.push(data.deity_is_default);
  }

  if (data.deity_display_order !== undefined) {
    fields.push("deity_display_order = ?");
    values.push(data.deity_display_order);
  }

  if (data.deity_status !== undefined) {
    fields.push("deity_status = ?");
    values.push(data.deity_status);
  }

  if (fields.length === 0) {
    return existing;
  }

  if (isDefault === "yes") {
    await connection.execute(
      `
        UPDATE deities
        SET
          deity_is_default = 'no',
          updated_at = CURRENT_TIMESTAMP
        WHERE organization_id = ?
          AND temple_id = ?
          AND id <> ?
          AND deleted_at IS NULL
          AND deity_is_default = 'yes'
      `,
      [organizationId, templeId, id]
    );
  }

  values.push(id, organizationId);

  await connection.execute<ResultSetHeader>(
    `
      UPDATE deities
      SET
        ${fields.join(", ")},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND organization_id = ?
        AND deleted_at IS NULL
    `,
    values
  );

  return getDeityByIdRepository(
    connection,
    id,
    organizationId
  );
};

/**
 * SOFT DELETE
 */
export const deleteDeityRepository = async (
  connection: PoolConnection,
  id: number,
  organizationId: number
): Promise<boolean> => {
  const [result] = await connection.execute<ResultSetHeader>(
    `
      UPDATE deities
      SET
        deleted_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND organization_id = ?
        AND deleted_at IS NULL
    `,
    [id, organizationId]
  );

  return result.affectedRows > 0;
};


export interface DeityAccessScope {
  organizationId: number;
  templeId: number | null;
}

/**
 * Fetch non-deleted deities within the user's organization.
 *
 * If templeId is provided, restrict results to that temple.
 * If templeId is null, return all deities in the organization.
 */
export async function findDeityByScope(
  connection: PoolConnection,
  scope: DeityAccessScope
): Promise<Deity[]> {
  if (
    !Number.isSafeInteger(scope.organizationId) ||
    scope.organizationId <= 0
  ) {
    throw new Error("Invalid organization ID");
  }

  let sql = `
    ${deitySelect}
    WHERE d.organization_id = ?
      AND d.deleted_at IS NULL
  `;

  const params: number[] = [scope.organizationId];

  if (scope.templeId !== null) {
    if (
      !Number.isSafeInteger(scope.templeId) ||
      scope.templeId <= 0
    ) {
      throw new Error("Invalid temple ID");
    }

    sql += " AND d.temple_id = ?";
    params.push(scope.templeId);
  }

  sql += `
    ORDER BY
      d.deity_display_order ASC,
      d.id DESC
  `;

  const [rows] = await connection.execute<DeityRow[]>(
    sql,
    params
  );

  return rows.map(mapDeity);
}
