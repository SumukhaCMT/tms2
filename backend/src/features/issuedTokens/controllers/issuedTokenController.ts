
import type { Request, Response } from "express";
import type { PoolConnection,RowDataPacket } from "mysql2/promise";
import pool from "../../../config/database";
import { createAuditLog } from "../../../utils/auditLog";
import type { CreateIssuedTokenPayload } from "../issuedTokenTypes";
import { createIssuedTokenService, getIssuedTokenService, getIssuedTokensService } from "../services/issuedTokenService";
import { createIssuedTokenSchema, issuedTokenListQuerySchema } from "../validations/issuedTokenValidation";
import { generateReceiptPrintHtml } from "../../../utils/receipt/receiptPrint";
function getUserScope(req: Request): { organizationId: number; userId: number; userTempleId: number | null } {
  const user = req.user;
  const organizationId = Number(user?.organization_id);
  const userId = Number(user?.id);
  const userTempleId = user?.temple_id == null ? null : Number(user.temple_id);
  if (!Number.isSafeInteger(organizationId) || organizationId <= 0) throw new Error("Organization ID not found");
  if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error("Authenticated user ID not found");
  if (userTempleId !== null && (!Number.isSafeInteger(userTempleId) || userTempleId <= 0)) throw new Error("Invalid temple ID");
  return { organizationId, userId, userTempleId };
}

function getId(req: Request): number {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid issued token ID");
  return id;
}

function sendError(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : "Internal server error";
  if (["Organization ID not found", "Authenticated user ID not found", "Invalid temple ID"].includes(message)) {
    return res.status(401).json({ success: false, message });
  }
  if (["Temple ID is required", "Invalid issued token ID", "Invalid Seva amount or GST configuration"].includes(message)) {
    return res.status(400).json({ success: false, message });
  }
  if (message === "Temple not found" || message === "Active token not found for this temple") {
    return res.status(404).json({ success: false, message });
  }
  if (message === "You cannot issue a token for another temple") return res.status(403).json({ success: false, message });
  if (["The selected token does not have a valid Seva", "Seva amount is not configured"].includes(message)) {
    return res.status(422).json({ success: false, message });
  }
  return res.status(500).json({ success: false, message: "An internal server error occurred." });
}

// function sendError(res: Response, error: unknown) {
//   console.error("[IssuedTokenController Error]:", error);

//   const message =
//     error instanceof Error ? error.message : "Internal server error";

//   if (
//     [
//       "Organization ID not found",
//       "Authenticated user ID not found",
//       "Invalid temple ID",
//     ].includes(message)
//   ) {
//     return res.status(401).json({ success: false, message });
//   }

//   if (
//     [
//       "Temple ID is required",
//       "Invalid issued token ID",
//       "Invalid Seva amount or GST configuration",
//     ].includes(message)
//   ) {
//     return res.status(400).json({ success: false, message });
//   }

//   if (
//     [
//       "Temple not found",
//       "Temple details not found",
//       "Issued token not found",
//       "Active token not found for this temple",
//     ].includes(message)
//   ) {
//     return res.status(404).json({ success: false, message });
//   }

//   if (message === "You cannot issue a token for another temple") {
//     return res.status(403).json({ success: false, message });
//   }

//   if (
//     [
//       "The selected token does not have a valid Seva",
//       "Seva amount is not configured",
//     ].includes(message)
//   ) {
//     return res.status(422).json({ success: false, message });
//   }

//   return res.status(500).json({
//     success: false,
//     message: "An internal server error occurred.",
//   });
// }


function auditMetadata(req: Request) {
  return {
    userId: req.user?.id,
    organizationId: req.user?.organization_id ?? null,
    templeId: req.user?.temple_id ?? null,
    ipAddress: req.ip,
    userAgent: req.get("user-agent") ?? null,
    endpoint: `${req.method} ${req.originalUrl}`,
  };
}

// export async function createIssuedTokenController(req: Request, res: Response) {
//   let connection: PoolConnection | undefined;
//   let transactionStarted = false;
//   try {
//     const { organizationId, userId, userTempleId } = getUserScope(req);
//     const validation = createIssuedTokenSchema.safeParse(req.body);
//     if (!validation.success) return res.status(400).json({ success: false, message: "Validation failed", errors: validation.error.flatten() });
//     const templeId = userTempleId ?? validation.data.temple_id;
//     if (templeId == null) return res.status(400).json({ success: false, message: "Temple ID is required" });
//     if (userTempleId !== null && validation.data.temple_id !== undefined && validation.data.temple_id !== userTempleId) {
//       return res.status(403).json({ success: false, message: "You cannot issue a token for another temple" });
//     }
//     const payload: CreateIssuedTokenPayload = {
//       token_id: validation.data.token_id,
//       temple_id: templeId,
//       token_quantity: validation.data.token_quantity,
//       token_payment_method: validation.data.token_payment_method,
//       token_performed_date: validation.data.token_performed_date,
//       token_remark: validation.data.token_remark ?? null,
//       // devotee_name: validation.data.devotee_name ?? null,
//       // devotee_mobile: validation.data.devotee_mobile ?? null,
//     };
//     connection = await pool.getConnection();
//     await connection.beginTransaction();
//     transactionStarted = true;
//     const issuedToken = await createIssuedTokenService(connection, organizationId, userId, userTempleId, payload);
//     await createAuditLog(connection, {
//       ...auditMetadata(req), action: "CREATE", module: "issued_token", tableName: "issued_tokens",
//       recordId: issuedToken.id, description: "Issued Token", newValues: issuedToken,
//     });
//     await connection.commit();
//     transactionStarted = false;
//     return res.status(201).json({ success: true, message: "Token issued successfully", data: issuedToken });
//   } catch (error) {
//     if (connection && transactionStarted) await connection.rollback();
//     return sendError(res, error);
//   } finally {
//     connection?.release();
//   }
// }


export async function createIssuedTokenController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const { organizationId, userId, userTempleId } = getUserScope(req);

    const validation = createIssuedTokenSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
    }

    const templeId = userTempleId ?? validation.data.temple_id;

    if (templeId == null) {
      return res.status(400).json({
        success: false,
        message: "Temple ID is required",
      });
    }

    if (
      userTempleId !== null &&
      validation.data.temple_id !== undefined &&
      validation.data.temple_id !== userTempleId
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot issue a token for another temple",
      });
    }

    const payload: CreateIssuedTokenPayload = {
      token_id: validation.data.token_id,
      temple_id: templeId,
      token_quantity: validation.data.token_quantity,
      token_payment_method: validation.data.token_payment_method,
      token_performed_date: validation.data.token_performed_date,
      token_remark: validation.data.token_remark ?? null,
    };

    connection = await pool.getConnection();

    await connection.beginTransaction();
    transactionStarted = true;

    const issuedToken = await createIssuedTokenService(
      connection,
      organizationId,
      userId,
      userTempleId,
      payload,
    );

    await createAuditLog(connection, {
      ...auditMetadata(req),
      action: "CREATE",
      module: "issued_token",
      tableName: "issued_tokens",
      recordId: issuedToken.id,
      description: "Issued Token",
      newValues: issuedToken,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "Token issued successfully",
      data: issuedToken,
    });

  } catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback();
      transactionStarted = false;
    }

    console.error("[CREATE ISSUED TOKEN ERROR]", error);

    if (error instanceof Error) {
      if (error.message.includes("Token limit exceeded")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message === "Token not found"
      ) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message === "This token is inactive" ||
        error.message.includes("Invalid") ||
        error.message.includes("quantity")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }

    return sendError(res, error);

  } finally {
    connection?.release();
  }
}

export async function getIssuedTokensController(req: Request, res: Response) {
  let connection: PoolConnection | undefined;
  try {
    const { organizationId, userTempleId } = getUserScope(req);
    const validation = issuedTokenListQuerySchema.safeParse(req.query);
    if (!validation.success) return res.status(400).json({ success: false, message: "Invalid query parameters", errors: validation.error.flatten() });
    if (validation.data.from_date && validation.data.to_date && validation.data.from_date > validation.data.to_date) {
      return res.status(400).json({ success: false, message: "from_date cannot be later than to_date" });
    }
    connection = await pool.getConnection();
    const result = await getIssuedTokensService(connection, organizationId, userTempleId, validation.data);
    return res.status(200).json({ success: true, message: "Issued tokens fetched successfully", data: result.data, pagination: result.pagination });
  } catch (error) {
    return sendError(res, error);
  } finally {
    connection?.release();
  }
}

export async function getIssuedTokenController(req: Request, res: Response) {
  let connection: PoolConnection | undefined;
  try {
    const { organizationId, userTempleId } = getUserScope(req);
    const id = getId(req);
    connection = await pool.getConnection();
    const issuedToken = await getIssuedTokenService(connection, organizationId, userTempleId, id);
    if (!issuedToken) return res.status(404).json({ success: false, message: "Issued token not found" });
    return res.status(200).json({ success: true, message: "Issued token fetched successfully", data: issuedToken });
  } catch (error) {
    return sendError(res, error);
  } finally {
    connection?.release();
  }
}
export async function printIssuedTokenController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;

  try {
    const { organizationId, userTempleId } = getUserScope(req);
    const id = getId(req);

    connection = await pool.getConnection();

    const issuedToken = await getIssuedTokenService(
      connection,
      organizationId,
      userTempleId,
      id,
    );

    if (!issuedToken) {
      return res.status(404).json({
        success: false,
        message: "Issued token not found",
      });
    }

    const templeId = Number(issuedToken.temple_id);

    // Fetch trusted organization and temple details.
    // Adjust these column names if your actual schema differs.
   const [rows] = await connection.execute<RowDataPacket[]>(
  `SELECT
     t.temp_name AS temple_name,

     NULLIF(
       TRIM(
         CONCAT_WS(
           ', ',
           NULLIF(t.temp_address_line1, ''),
           NULLIF(t.temp_address_line2, ''),
           NULLIF(t.temp_city, ''),
           NULLIF(t.temp_state, ''),
           NULLIF(t.temp_country, ''),
           NULLIF(t.temp_pincode, '')
         )
       ),
       ''
     ) AS temple_address,

     t.temp_phone AS temple_phone,
     o.org_name AS organization_name

   FROM temples t
   INNER JOIN organizations o
     ON o.id = t.organization_id

   WHERE t.id = ?
     AND t.organization_id = ?
     AND t.deleted_at IS NULL

   LIMIT 1`,
  [templeId, organizationId],
);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Temple details not found",
      });
    }

    const temple = rows[0];

    const quantity = Number(issuedToken.token_quantity);
    const rate = Number(issuedToken.token_seva_amount);
    const gstAmount = Number(issuedToken.token_gst_amount);
    const totalAmount = Number(issuedToken.token_total_amount);
    const subtotal = totalAmount - gstAmount;
function formatReceiptDate(value: unknown): string {
  if (!value) return "";

  const date = new Date(value as string | Date);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(date);
}
    const receipt = await generateReceiptPrintHtml(
      connection,
      organizationId,
      templeId,
      {
        receiptNumber: issuedToken.token_receipt_number,
        organizationName: temple.organization_name,
        templeName: temple.temple_name,
        templeAddress: temple.temple_address,
        templePhone: temple.temple_phone,
        receiptTitle: "ISSUED TOKEN RECEIPT",
      date: formatReceiptDate(issuedToken.token_paid_at),
        paymentMethod: issuedToken.token_payment_method,
        items: [
          {
            name: issuedToken.token_seva_name,
            deity: issuedToken.token_deity_name,
            quantity,
            rate,
            amount: subtotal,
          },
        ],
        subtotal,
        gstAmount,
        totalAmount,
        remark: issuedToken.token_remark,
      },
    );

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Receipt-Print-Type", receipt.printType);

    return res.status(200).send(receipt.html);
  } catch (error) {
    return sendError(res, error);
  } finally {
    connection?.release();
  }
}