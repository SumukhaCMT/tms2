



import type { PoolConnection } from "mysql2/promise";

import {
  createToken as createTokenRepository,
  deactivateToken,
  findAllTokens,
  findTokenById,
  updateToken as updateTokenRepository,
} from "../repositories/tokenRepository";

import type {
  CreateTokenPayload,
  Token,
  TokenListQuery,
  TokenRepositoryListResult,
  UpdateTokenPayload,
} from "../tokenTypes";

export async function createTokenService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  data: CreateTokenPayload,
): Promise<Token> {
  // Temple-scoped users must use their assigned temple.
  const templeId = userTempleId ?? data.temple_id;

  if (!Number.isSafeInteger(templeId) || templeId <= 0) {
    throw new Error("Temple ID is required");
  }

  const id = await createTokenRepository(
    connection,
    organizationId,
    {
      ...data,
      temple_id: templeId,
    },
  );

  // Retrieve the inserted record with joined Temple, Seva and Deity names.
  const token = await findTokenById(
    connection,
    organizationId,
    userTempleId,
    id,
  );

  if (!token) {
    throw new Error("Failed to retrieve created Token");
  }

  return token;
}

export async function getTokensService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  query: TokenListQuery,
): Promise<TokenRepositoryListResult> {
  return findAllTokens(
    connection,
    organizationId,
    userTempleId,
    query,
  );
}

export async function getTokenService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
): Promise<Token | null> {
  return findTokenById(
    connection,
    organizationId,
    userTempleId,
    id,
  );
}

export async function updateTokenService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
  data: UpdateTokenPayload,
): Promise<Token | null> {
  const updated = await updateTokenRepository(
    connection,
    organizationId,
    userTempleId,
    id,
    data,
  );

  if (!updated) {
    return null;
  }

  // Return the updated record, including joined display names.
  return findTokenById(
    connection,
    organizationId,
    userTempleId,
    id,
  );
}

export async function deleteTokenService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
): Promise<boolean> {
  return deactivateToken(
    connection,
    organizationId,
    userTempleId,
    id,
  );
}
