
import type { PoolConnection } from "mysql2/promise";
import {
  createIssuedToken as createIssuedTokenRepository,
  findAllIssuedTokens,
  findIssuedTokenById,
  findTokenForIssuing,
} from "../repositories/issuedTokenRepository";
import type {
  CreateIssuedTokenPayload,
  IssuedToken,
  IssuedTokenListQuery,
  IssuedTokenListResult,
} from "../issuedTokenTypes";

export async function createIssuedTokenService(
  connection: PoolConnection,
  organizationId: number,
  userId: number,
  userTempleId: number | null,
  data: CreateIssuedTokenPayload,
): Promise<IssuedToken> {
  const templeId = userTempleId ?? data.temple_id;
  if (!Number.isSafeInteger(templeId) || templeId <= 0) throw new Error("Temple ID is required");
  if (userTempleId !== null && data.temple_id !== userTempleId) throw new Error("You cannot issue a token for another temple");

  const [temples] = await connection.execute<Array<{ id: number } & import("mysql2/promise").RowDataPacket>>(
    `SELECT id FROM temples WHERE id = ? AND organization_id = ? AND deleted_at IS NULL LIMIT 1`,
    [templeId, organizationId],
  );
  if (temples.length === 0) throw new Error("Temple not found");

  const token = await findTokenForIssuing(connection, organizationId, templeId, data.token_id);
  if (!token) throw new Error("Active token not found for this temple");
  if (token.seva_id == null || token.seva_name == null) throw new Error("The selected token does not have a valid Seva");
  if (token.seva_amount == null) throw new Error("Seva amount is not configured");

  const id = await createIssuedTokenRepository(connection, organizationId, userId, { ...data, temple_id: templeId }, token);
  const issuedToken = await findIssuedTokenById(connection, organizationId, userTempleId, id);
  if (!issuedToken) throw new Error("Failed to retrieve issued token");
  return issuedToken;
}

export function getIssuedTokensService(connection: PoolConnection, organizationId: number, userTempleId: number | null, query: IssuedTokenListQuery): Promise<IssuedTokenListResult> {
  return findAllIssuedTokens(connection, organizationId, userTempleId, query);
}

export function getIssuedTokenService(connection: PoolConnection, organizationId: number, userTempleId: number | null, id: number): Promise<IssuedToken | null> {
  return findIssuedTokenById(connection, organizationId, userTempleId, id);
}