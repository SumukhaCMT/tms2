
import type { Request, Response } from "express";
import type { PoolConnection } from "mysql2/promise";

import pool from "../../../config/database";
import { createAuditLog } from "../../../utils/auditLog";
import type { CreateTokenPayload } from "../tokenTypes";
import {
  createTokenService,
  deleteTokenService,
  getTokenService,
  getTokensService,
  updateTokenService,
} from "../services/tokenService";

import {
  createTokenSchema,
  tokenListQuerySchema,
  updateTokenSchema,
} from "../validations/tokenValidation";

import { handleTokenError } from "../validations/tokenErrors";

function getUserScope(req: Request): {
  organizationId: number;
  userTempleId: number | null;
} {
  const user = req.user;
  const organizationId = Number(user?.organization_id);

  if (
    user?.organization_id == null ||
    !Number.isSafeInteger(organizationId) ||
    organizationId <= 0
  ) {
    throw new Error("Organization ID not found");
  }

  const userTempleId =
    user.temple_id == null ? null : Number(user.temple_id);

  if (
    userTempleId !== null &&
    (!Number.isSafeInteger(userTempleId) || userTempleId <= 0)
  ) {
    throw new Error("Invalid temple ID");
  }

  return { organizationId, userTempleId };
}

function getId(req: Request): number {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid token ID");
  }

  return id;
}

function getAuditMetadata(req: Request) {
  if (!req.user?.id) {
    throw new Error("Authenticated user ID not found");
  }

  return {
    userId: req.user.id,
    organizationId: req.user.organization_id ?? null,
    templeId: req.user.temple_id ?? null,
    ipAddress: req.ip,
    userAgent: req.get("user-agent") ?? null,
    endpoint: `${req.method} ${req.originalUrl}`,
  };
}

function sendError(res: Response, error: unknown) {
  if (error instanceof Error) {
    if (
      error.message === "Organization ID not found" ||
      error.message === "Invalid temple ID" ||
      error.message === "Authenticated user ID not found"
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Invalid token ID") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Temple ID is required") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  return handleTokenError(error, res);
}

/**
 * POST /api/v1/tokens
 */
export async function createTokenController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const { organizationId, userTempleId } = getUserScope(req);
    const validation = createTokenSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
    }

    if (
      userTempleId !== null &&
      validation.data.temple_id !== undefined &&
      validation.data.temple_id !== userTempleId
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot create a Token for another temple",
      });
    }

    // const payload = {
    //   ...validation.data,
    //   temple_id: userTempleId ?? validation.data.temple_id,
    // };

    // if (payload.temple_id === undefined) 
//     const templeId = userTempleId ?? validation.data.temple_id;

// if (templeId === undefined || templeId === null) {
//   return res.status(400).json({
//     success: false,
//     message: "Temple ID is required",
//   });
// }

// const payload: CreateTokenPayload = {
//   ...validation.data,
//    temple_id: templeId,
//   token_description: validation.data.token_description ?? null,
//   seva_id: validation.data.seva_id ?? null,
//   deity_id: validation.data.deity_id ?? null,
//   token_display_order: validation.data.token_display_order ?? 0,
//   token_status: validation.data.token_status ?? "active",
// };

const templeId = userTempleId ?? validation.data.temple_id;

if (templeId == null) {
  return res.status(400).json({
    success: false,
    message: "Temple ID is required",
  });
}

// const payload: CreateTokenPayload = {
//   temple_id: templeId,
//   token_name: validation.data.token_name,
//   token_description:
//     validation.data.token_description === undefined
//       ? null
//       : validation.data.token_description,
//   seva_id:
//     validation.data.seva_id === undefined
//       ? null
//       : validation.data.seva_id,
//   deity_id:
//     validation.data.deity_id === undefined
//       ? null
//       : validation.data.deity_id,
//   token_display_order:
//     validation.data.token_display_order === undefined
//       ? 0
//       : validation.data.token_display_order,
//   token_status:
//     validation.data.token_status === undefined
//       ? "active"
//       : validation.data.token_status,
// };
const payload: CreateTokenPayload = {
  temple_id: templeId,
  token_name: validation.data.token_name,

  max_limit: validation.data.max_limit ?? null,

  token_description:
    validation.data.token_description ?? null,

  seva_id:
    validation.data.seva_id ?? null,

  deity_id:
    validation.data.deity_id ?? null,

  token_display_order:
    validation.data.token_display_order ?? 0,

  token_status:
    validation.data.token_status ?? "active",
};
connection = await pool.getConnection();
await connection.beginTransaction();
transactionStarted = true;

const token = await createTokenService(
  connection,
  organizationId,
  userTempleId,
  payload,
);
    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "CREATE",
      module: "token",
      tableName: "tokens",
      recordId: token.id,
      description: "Created Token",
      newValues: token,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "Token created successfully",
      data: token,
    });
  } catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback();
      transactionStarted = false;
    }

    return sendError(res, error);
  } finally {
    connection?.release();
  }
}

/**
 * GET /api/v1/tokens
 */
export async function getTokensController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;

  try {
    const { organizationId, userTempleId } = getUserScope(req);
    const validation = tokenListQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: validation.error.flatten(),
      });
    }

    connection = await pool.getConnection();

    const result = await getTokensService(
      connection,
      organizationId,
      userTempleId,
      validation.data,
    );

    // await createAuditLog(connection, {
    //   ...getAuditMetadata(req),
    //   action: "READ",
    //   module: "token",
    //   tableName: "tokens",
    //   recordId: null,
    //   description: "Fetched Token list",
    //   newValues: {
    //     page: validation.data.page,
    //     limit: validation.data.limit,
    //     search: validation.data.search ?? null,
    //   },
    // });

    return res.status(200).json({
      success: true,
      message: "Tokens fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return sendError(res, error);
  } finally {
    connection?.release();
  }
}

/**
 * GET /api/v1/tokens/:id
 */
export async function getTokenController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;

  try {
    const { organizationId, userTempleId } = getUserScope(req);
    const id = getId(req);

    connection = await pool.getConnection();

    const token = await getTokenService(
      connection,
      organizationId,
      userTempleId,
      id,
    );

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    // await createAuditLog(connection, {
    //   ...getAuditMetadata(req),
    //   action: "READ",
    //   module: "token",
    //   tableName: "tokens",
    //   recordId: id,
    //   description: "Viewed Token",
    //   newValues: token,
    // });

    return res.status(200).json({
      success: true,
      message: "Token fetched successfully",
      data: token,
    });
  } catch (error) {
    return sendError(res, error);
  } finally {
    connection?.release();
  }
}

/**
 * PUT /api/v1/tokens/:id
 */
export async function updateTokenController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const { organizationId, userTempleId } = getUserScope(req);
    const id = getId(req);
    const validation = updateTokenSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
    }

    if (
      userTempleId !== null &&
      validation.data.temple_id !== undefined &&
      validation.data.temple_id !== userTempleId
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot move a Token to another temple",
      });
    }

    const payload =
      userTempleId !== null
        ? { ...validation.data, temple_id: userTempleId }
        : validation.data;

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const oldToken = await getTokenService(
      connection,
      organizationId,
      userTempleId,
      id,
    );

    if (!oldToken) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    const token = await updateTokenService(
      connection,
      organizationId,
      userTempleId,
      id,
      payload,
    );

    if (!token) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "UPDATE",
      module: "token",
      tableName: "tokens",
      recordId: id,
      description: "Updated Token",
      oldValues: oldToken,
      newValues: token,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Token updated successfully",
      data: token,
    });
  } catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback();
      transactionStarted = false;
    }

    return sendError(res, error);
  } finally {
    connection?.release();
  }
}

/**
 * DELETE /api/v1/tokens/:id
 * Deactivates the token because the supplied schema has no deleted_at column.
 */
export async function deleteTokenController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const { organizationId, userTempleId } = getUserScope(req);
    const id = getId(req);

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const oldToken = await getTokenService(
      connection,
      organizationId,
      userTempleId,
      id,
    );

    if (!oldToken) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }
// if status inactive then organization admin also not able to delete this
    // if (oldToken.token_status === "inactive") {
    //   await connection.rollback();
    //   transactionStarted = false;

    //   return res.status(409).json({
    //     success: false,
    //     message: "Token is already inactive",
    //   });
    // }

    const deleted = await deleteTokenService(
      connection,
      organizationId,
      userTempleId,
      id,
    );

    if (!deleted) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "DELETE",
      module: "token",
      tableName: "tokens",
      recordId: id,
      description: "Deactivated Token",
      oldValues: oldToken,
      newValues: { ...oldToken, token_status: "inactive" },
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Token deactivated successfully",
    });
  } catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback();
      transactionStarted = false;
    }

    return sendError(res, error);
  } finally {
    connection?.release();
  }
}
