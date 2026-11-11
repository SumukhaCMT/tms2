



import type { PoolConnection } from "mysql2/promise";

import {
  createSeva,
  findAllSevas,
  findSevaById,
  softDeleteSeva,
  updateSeva,
} from "../repositories/sevaRepository";

import type {
  CreateSevaPayload,
  Seva,
  SevaListQuery,
  SevaListResult,
  UpdateSevaPayload,
} from "../sevaTypes";

/**
 * CREATE SEVA
 */
export async function createSevaService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  data: CreateSevaPayload,
): Promise<Seva> {
  const templeId =
    userTempleId !== null
      ? userTempleId
      : data.temple_id;

  const id = await createSeva(
    connection,
    organizationId,
    {
      ...data,
      temple_id: templeId,
    },
  );

  const seva = await findSevaById(
    connection,
    organizationId,
    userTempleId,
    id,
  );

  if (!seva) {
    throw new Error("Failed to retrieve created Seva");
  }

  return seva;
}

/**
 * LIST SEVAS
 */
export async function getSevasService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  query: SevaListQuery,
): Promise<SevaListResult> {
  return findAllSevas(
    connection,
    organizationId,
    userTempleId,
    query,
  );
}

/**
 * GET SEVA BY ID
 */
export async function getSevaService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
): Promise<Seva | null> {
  return findSevaById(
    connection,
    organizationId,
    userTempleId,
    id,
  );
}

/**
 * UPDATE SEVA
 */
export async function updateSevaService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
  data: UpdateSevaPayload,
): Promise<Seva | null> {
  const updated = await updateSeva(
    connection,
    organizationId,
    userTempleId,
    id,
    data,
  );

  if (!updated) {
    return null;
  }

  return findSevaById(
    connection,
    organizationId,
    userTempleId,
    id,
  );
}

/**
 * SOFT DELETE SEVA
 */
export async function deleteSevaService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
): Promise<boolean> {
  return softDeleteSeva(
    connection,
    organizationId,
    userTempleId,
    id,
  );
}
