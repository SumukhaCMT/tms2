
import type { PoolConnection } from "mysql2/promise";


import {
  createDeityRepository,
  deleteDeityRepository,
  findDeityByScope,
  getDeityByIdRepository,
  updateDeityRepository,
  type DeityAccessScope,
} from "../repositories/deityRepository";

import type {
  CreateDeityInput,
  UpdateDeityInput,
} from "../deityTypes";

export const createDeityService = (
  connection: PoolConnection,
  data: CreateDeityInput
) => createDeityRepository(connection, data);

// export const getDeitiesService = (
//   connection: PoolConnection,
//   organizationId: number
 
// ) =>  getDeitiesRepository(connection, organizationId);

export const getDeitiesService = (
  connection: PoolConnection,
  scope: DeityAccessScope
) => findDeityByScope(connection, scope);

export const getDeityService = (
  connection: PoolConnection,
  id: number,
  organizationId: number
) => getDeityByIdRepository(connection, id, organizationId);

export const updateDeityService = (
  connection: PoolConnection,
  id: number,
  organizationId: number,
  data: UpdateDeityInput
) =>
  updateDeityRepository(
    connection,
    id,
    organizationId,
    data
  );

export const deleteDeityService = (
  connection: PoolConnection,
  id: number,
  organizationId: number
) =>
  deleteDeityRepository(connection, id, organizationId);