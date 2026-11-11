



import type { RowDataPacket } from "mysql2/promise";

import pool from "../../../config/database";
import * as trusteeRepository from "../repositories/trusteeRepository";

import type {
  CreateTrusteePayload,
  TrusteeListQuery,
  UpdateTrusteePayload,
} from "../trusteeTypes";

export class TrusteeNotFoundError extends Error {
  constructor() {
    super("Trustee not found");
    this.name = "TrusteeNotFoundError";
  }
}

export class TrusteeTempleError extends Error {
  constructor() {
    super("Temple does not belong to this organization");
    this.name = "TrusteeTempleError";
  }
}

export class TrusteeDateError extends Error {
  constructor() {
    super("End date must be later than start date");
    this.name = "TrusteeDateError";
  }
}

async function assertTempleBelongsToOrganization(
  organizationId: number,
  templeId: number | null | undefined,
): Promise<void> {
  if (templeId == null) return;

  const [rows] = await pool.execute<RowDataPacket[]>(
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
    throw new TrusteeTempleError();
  }
}

function assertValidDates(startDate: string, endDate: string): void {
  // ISO YYYY-MM-DD dates can be compared lexicographically.
  if (endDate <= startDate) {
    throw new TrusteeDateError();
  }
}

export async function list(
  organizationId: number,
  userTempleId: number | null,
  query: TrusteeListQuery,
) {
  return trusteeRepository.findTrustees(
    organizationId,
    userTempleId,
    query,
  );
}

export async function getById(
  organizationId: number,
  userTempleId: number | null,
  id: number,
) {
  const trustee = await trusteeRepository.findTrusteeById(
    organizationId,
    userTempleId,
    id,
  );

  if (!trustee) {
    throw new TrusteeNotFoundError();
  }

  return trustee;
}

export async function create(
  organizationId: number,
  userTempleId: number | null,
  payload: CreateTrusteePayload,
) {
  assertValidDates(payload.start_date, payload.end_date);

  const templeId =
    userTempleId !== null ? userTempleId : payload.temple_id;

  await assertTempleBelongsToOrganization(organizationId, templeId);

  const id = await trusteeRepository.createTrustee(organizationId, {
    ...payload,
    temple_id: templeId,
  });

  return getById(organizationId, userTempleId, id);
}

export async function update(
  organizationId: number,
  userTempleId: number | null,
  id: number,
  payload: UpdateTrusteePayload,
) {
  const existing = await trusteeRepository.findTrusteeById(
    organizationId,
    userTempleId,
    id,
  );

  if (!existing) {
    throw new TrusteeNotFoundError();
  }

  const targetTempleId =
    userTempleId !== null
      ? userTempleId
      : payload.temple_id === undefined
        ? existing.temple_id
        : payload.temple_id;

  await assertTempleBelongsToOrganization(
    organizationId,
    targetTempleId,
  );

  const startDate = payload.start_date ?? existing.start_date;
  const endDate = payload.end_date ?? existing.end_date;

  assertValidDates(startDate, endDate);

  const updated = await trusteeRepository.updateTrustee(
    organizationId,
    userTempleId,
    id,
    payload,
  );

  if (!updated) {
    throw new TrusteeNotFoundError();
  }

  return getById(organizationId, userTempleId, id);
}

export async function remove(
  organizationId: number,
  userTempleId: number | null,
  id: number,
): Promise<void> {
  const existing = await trusteeRepository.findTrusteeById(
    organizationId,
    userTempleId,
    id,
  );

  if (!existing) {
    throw new TrusteeNotFoundError();
  }

  const deleted = await trusteeRepository.softDeleteTrustee(
    organizationId,
    userTempleId,
    id,
  );

  if (!deleted) {
    throw new TrusteeNotFoundError();
  }
}
