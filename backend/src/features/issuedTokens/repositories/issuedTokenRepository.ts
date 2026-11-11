
import { randomUUID } from "node:crypto";
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type {
  CreateIssuedTokenPayload,
  IssuedToken,
  IssuedTokenListQuery,
  IssuedTokenListResult,
  TokenForIssuing,
} from "../issuedTokenTypes";

interface CountRow extends RowDataPacket { total: number }
type SqlValue = string | number | null;

const SELECT_FIELDS = `
  it.id, it.organization_id, it.temple_id, it.token_id, it.token_name,
  
  it.token_seva_id, it.token_seva_name, it.token_deity_id, it.token_deity_name,
  it.token_quantity, it.token_seva_amount, it.token_gst_percent, it.token_gst_amount,
  it.token_total_amount, it.token_payment_method, it.token_paid_at,
  it.token_receipt_number, it.token_receipt_generated_at, it.token_status,
  it.token_performed_date, it.token_remark, it.issued_by_user_id,
  it.created_at, it.updated_at
`;

export async function findTokenForIssuing(
  connection: PoolConnection,
  organizationId: number,
  templeId: number,
  tokenId: number,
): Promise<TokenForIssuing | null> {
  const [rows] = await connection.execute<TokenForIssuing[]>(
    `SELECT t.id, t.organization_id, t.temple_id, t.token_name, t.token_status,
            t.seva_id, t.deity_id, s.seva_name, s.seva_amount, s.seva_gst_percent,
            d.deity_name
       FROM tokens t
       LEFT JOIN sevas s ON s.id = t.seva_id
          AND s.organization_id = t.organization_id AND s.temple_id = t.temple_id
       LEFT JOIN deities d ON d.id = t.deity_id
          AND d.organization_id = t.organization_id AND d.temple_id = t.temple_id
      WHERE t.id = ? AND t.organization_id = ? AND t.temple_id = ?
        AND t.token_status = 'active' AND t.deleted_at IS NULL
      LIMIT 1 FOR UPDATE`,
    [tokenId, organizationId, templeId],
  );
  return rows[0] ?? null;
}

// export async function createIssuedToken(
//   connection: PoolConnection,
//   organizationId: number,
//   userId: number,
//   data: CreateIssuedTokenPayload,
//   token: TokenForIssuing,
// ): Promise<number> {
//   const sevaAmount = Number(token.seva_amount ?? 0);
//   const gstPercent = Number(token.seva_gst_percent ?? 0);
//   if (!Number.isFinite(sevaAmount) || sevaAmount < 0 || !Number.isFinite(gstPercent) || gstPercent < 0) {
//     throw new Error("Invalid Seva amount or GST configuration");
//   }

//   const subtotal = Math.round(sevaAmount * data.token_quantity);
//   const gstAmount = Math.round((subtotal * gstPercent) / 100);
//   const totalAmount = subtotal + gstAmount;
//   const receiptNumber = `IT-${Date.now()}-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;

//   const [result] = await connection.execute<ResultSetHeader>(
//     `INSERT INTO issued_tokens (
//        organization_id, temple_id, token_id, token_name,
     
//        token_seva_id, token_seva_name, token_deity_id, token_deity_name,
//        token_quantity, token_seva_amount, token_gst_percent, token_gst_amount,
//        token_total_amount, token_payment_method, token_paid_at,
//        token_receipt_number, token_receipt_generated_at, token_status,
//        token_performed_date, token_remark, issued_by_user_id
//      ) VALUES (?, ?, ?, ?, ?, ?, ?,  ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), 'completed', ?, ?, ?)`,
//     [
//       organizationId, data.temple_id, token.id, token.token_name, 
//       token.seva_id, token.seva_name ?? "Seva", token.deity_id, token.deity_name,
//       data.token_quantity, Math.round(sevaAmount), gstPercent, gstAmount,
//       totalAmount, data.token_payment_method, receiptNumber,
//       data.token_performed_date, data.token_remark, userId,
//     ],
//   );

//   if (!Number.isSafeInteger(result.insertId) || result.insertId <= 0) {
//     throw new Error("Failed to issue token");
//   }
//   return result.insertId;
// }

export async function createIssuedToken(
  connection: PoolConnection,
  organizationId: number,
  userId: number,
  data: CreateIssuedTokenPayload,
  token: TokenForIssuing,
): Promise<number> {

  // 1. Validate quantity
  if (
    !Number.isSafeInteger(data.token_quantity) ||
    data.token_quantity <= 0
  ) {
    throw new Error("Token quantity must be greater than zero");
  }

  // 2. Lock token row to prevent concurrent over-issuing
  const [tokenRows] = await connection.execute<
    (RowDataPacket & {
      max_limit: number | null;
      token_status: string;
    })[]
  >(
    `SELECT max_limit, token_status
     FROM tokens
     WHERE id = ?
       AND organization_id = ?
       AND temple_id = ?
       AND deleted_at IS NULL
     FOR UPDATE`,
    [token.id, organizationId, data.temple_id],
  );

  if (!tokenRows.length) {
    throw new Error("Token not found");
  }

  const maxLimit = tokenRows[0].max_limit;

  if (tokenRows[0].token_status !== "active") {
    throw new Error("This token is inactive");
  }

  // 3. Check maximum issue limit
  if (maxLimit !== null) {
    const [issuedRows] = await connection.execute<
      (RowDataPacket & { total_issued: number | string })[]
    >(
      `SELECT COALESCE(SUM(token_quantity), 0) AS total_issued
       FROM issued_tokens
       WHERE organization_id = ?
         AND temple_id = ?
         AND token_id = ?
         AND token_status = 'completed'`,
      [organizationId, data.temple_id, token.id],
    );

    const totalIssued = Number(issuedRows[0].total_issued);
    const remaining = maxLimit - totalIssued;

    if (data.token_quantity > remaining) {
      throw new Error(
        `Token limit exceeded. Maximum limit: ${maxLimit}, Already issued: ${totalIssued}, Remaining: ${Math.max(0, remaining)}, Requested: ${data.token_quantity}`,
      );
    }
  }

  // 4. Validate Seva amount and GST
  const sevaAmount = Number(token.seva_amount ?? 0);
  const gstPercent = Number(token.seva_gst_percent ?? 0);

  if (
    !Number.isFinite(sevaAmount) ||
    sevaAmount < 0 ||
    !Number.isFinite(gstPercent) ||
    gstPercent < 0
  ) {
    throw new Error("Invalid Seva amount or GST configuration");
  }

  // 5. Calculate amounts
  const subtotal = Math.round(sevaAmount * data.token_quantity);
  const gstAmount = Math.round((subtotal * gstPercent) / 100);
  const totalAmount = subtotal + gstAmount;

  // 6. Generate receipt number
  const receiptNumber = `IT-${Date.now()}-${randomUUID()
    .replace(/-/g, "")
    .slice(0, 8)
    .toUpperCase()}`;

  // 7. Insert issued token
  const [result] = await connection.execute<ResultSetHeader>(
    `INSERT INTO issued_tokens (
       organization_id, temple_id, token_id, token_name,
       token_seva_id, token_seva_name, token_deity_id, token_deity_name,
       token_quantity, token_seva_amount, token_gst_percent, token_gst_amount,
       token_total_amount, token_payment_method, token_paid_at,
       token_receipt_number, token_receipt_generated_at, token_status,
       token_performed_date, token_remark, issued_by_user_id
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), 'completed', ?, ?, ?)`,
    [
      organizationId,
      data.temple_id,
      token.id,
      token.token_name,
      token.seva_id,
      token.seva_name ?? "Seva",
      token.deity_id,
      token.deity_name,
      data.token_quantity,
      Math.round(sevaAmount),
      gstPercent,
      gstAmount,
      totalAmount,
      data.token_payment_method,
      receiptNumber,
      data.token_performed_date,
      data.token_remark,
      userId,
    ],
  );

  if (!Number.isSafeInteger(result.insertId) || result.insertId <= 0) {
    throw new Error("Failed to issue token");
  }

  return result.insertId;
}
export async function findIssuedTokenById(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
): Promise<IssuedToken | null> {
  const conditions = ["it.id = ?", "it.organization_id = ?"];
  const params: SqlValue[] = [id, organizationId];
  if (userTempleId !== null) { conditions.push("it.temple_id = ?"); params.push(userTempleId); }
  const [rows] = await connection.execute<IssuedToken[]>(
    `SELECT ${SELECT_FIELDS} FROM issued_tokens it WHERE ${conditions.join(" AND ")} LIMIT 1`,
    params,
  );
  return rows[0] ?? null;
}

export async function findAllIssuedTokens(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  query: IssuedTokenListQuery,
): Promise<IssuedTokenListResult> {
  const conditions = ["it.organization_id = ?"];
  const params: SqlValue[] = [organizationId];
  if (userTempleId !== null) {
    conditions.push("it.temple_id = ?"); params.push(userTempleId);
  } else if (query.temple_id !== undefined) {
    conditions.push("it.temple_id = ?"); params.push(query.temple_id);
  }
  if (query.token_status) { conditions.push("it.token_status = ?"); params.push(query.token_status); }
  if (query.search) {
    conditions.push("(it.token_name LIKE ? OR it.token_receipt_number LIKE ? OR it.token_seva_name LIKE ? OR it.token_deity_name LIKE ?)");
    const term = `%${query.search}%`; params.push(term, term, term, term);
  }
  if (query.from_date) { conditions.push("it.token_performed_date >= ?"); params.push(query.from_date); }
  if (query.to_date) { conditions.push("it.token_performed_date <= ?"); params.push(query.to_date); }
  const where = conditions.join(" AND ");
  const [countRows] = await connection.execute<CountRow[]>(
    `SELECT COUNT(*) AS total FROM issued_tokens it WHERE ${where}`, params,
  );
  const total = Number(countRows[0]?.total ?? 0);
  const offset = (query.page - 1) * query.limit;
  const [rows] = await connection.execute<IssuedToken[]>(
    `SELECT ${SELECT_FIELDS} FROM issued_tokens it WHERE ${where}
     ORDER BY it.created_at DESC, it.id DESC LIMIT ? OFFSET ?`,
    [...params, query.limit, offset],
  );
  return { data: rows, pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
}