import type { PoolConnection } from "mysql2/promise";

import {
  assertTempleBelongsToOrganization,
  findAllDevotees,
  findDevoteeById,
  updateDevotee,
  deleteDevotee as deleteDevoteeRepository,
} from "../repositories/devoteeRepository";

import type {
  Devotee,
  DevoteeListQuery,
  DevoteeListResult,
  UpdateDevoteePayload,
} from "../devoteeTypes";

/**
 * GET ALL DEVOTEES
 */
export async function getDevoteesService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  query: DevoteeListQuery,
): Promise<DevoteeListResult> {
  return findAllDevotees(
    connection,
    organizationId,
    userTempleId,
    query,
  );
}

/**
 * GET DEVOTEE BY ID
 */
export async function getDevoteeService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
): Promise<Devotee | null> {
  return findDevoteeById(
    connection,
    organizationId,
    userTempleId,
    id,
  );
}

/**
 * UPDATE DEVOTEE
 */
export async function updateDevoteeService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
  data: UpdateDevoteePayload,
): Promise<Devotee | null> {
  // Check whether devotee exists in the user's scope.
  const current = await findDevoteeById(
    connection,
    organizationId,
    userTempleId,
    id,
  );

  if (!current) {
    return null;
  }

  // Temple-scoped users cannot move devotees to another temple.
  const payload: UpdateDevoteePayload =
    userTempleId !== null
      ? {
          ...data,
          temple_id: userTempleId,
        }
      : data;

  // Organization-scoped users can assign a devotee to another
  // temple, but only within their own organization.
  if (
    payload.temple_id !== undefined &&
    payload.temple_id !== null
  ) {
    await assertTempleBelongsToOrganization(
      connection,
      organizationId,
      payload.temple_id,
    );
  }

  await updateDevotee(
    connection,
    organizationId,
    userTempleId,
    id,
    payload,
  );

  // Fetch updated record.
  return findDevoteeById(
    connection,
    organizationId,
    userTempleId,
    id,
  );
}
export async function deleteDevoteeService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
): Promise<Devotee | null> {
  const current = await findDevoteeById(
    connection,
    organizationId,
    userTempleId,
    id,
  );

  if (!current) {
    return null;
  }

  const deleted = await deleteDevoteeRepository(
    connection,
    organizationId,
    userTempleId,
    id,
  );

  return deleted ? current : null;
}