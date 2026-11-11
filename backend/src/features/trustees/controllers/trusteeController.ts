




import type { Request, Response } from "express";

import * as trusteeService from "../services/trusteeService";

import {
  createTrusteeSchema,
  updateTrusteeSchema,
  trusteeIdSchema,
  trusteeListQuerySchema,
} from "../validations/trusteeValidation";

import pool from "../../../config/database";
import { createAuditLog } from "../../../utils/auditLog";

import type { PoolConnection } from "mysql2/promise";

/* =========================================================
   ERROR HANDLER
========================================================= */

function handleError(res: Response, error: unknown) {
  if (error instanceof trusteeService.TrusteeNotFoundError) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof trusteeService.TrusteeTempleError) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof trusteeService.TrusteeDateError) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof Error) {
    if (
      error.message === "Authenticated organization is required" ||
      error.message === "Authenticated user ID is required"
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Authenticated temple ID is invalid") {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  const message =
    error instanceof Error ? error.message : String(error);

  const stack =
    error instanceof Error ? error.stack : undefined;

  process.stderr.write(
    `[TRUSTEE API ERROR] ${message}\n${stack ?? ""}\n`,
  );

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV !== "production"
      ? { error: message }
      : {}),
  });
}

/* =========================================================
   AUTHENTICATED USER SCOPE
========================================================= */

function getUserScope(req: Request): {
  organizationId: number;
  userTempleId: number | null;
} {
  const user = req.user;

  if (
    !user ||
    user.organization_id == null ||
    !Number.isSafeInteger(Number(user.organization_id)) ||
    Number(user.organization_id) <= 0
  ) {
    throw new Error("Authenticated organization is required");
  }

  const organizationId = Number(user.organization_id);

  const userTempleId =
    user.temple_id == null ? null : Number(user.temple_id);

  if (
    userTempleId !== null &&
    (!Number.isSafeInteger(userTempleId) || userTempleId <= 0)
  ) {
    throw new Error("Authenticated temple ID is invalid");
  }

  return {
    organizationId,
    userTempleId,
  };
}

/* =========================================================
   AUDIT METADATA
========================================================= */

function getAuditMetadata(req: Request) {
  const userId = req.user?.id;

  if (
    typeof userId !== "number" ||
    !Number.isSafeInteger(userId) ||
    userId <= 0
  ) {
    throw new Error("Authenticated user ID is required");
  }

  const organizationId = req.user?.organization_id;
  const templeId = req.user?.temple_id;

  return {
    userId,
    organizationId:
      organizationId == null ? null : Number(organizationId),
    templeId: templeId == null ? null : Number(templeId),
    ipAddress: req.ip ?? null,
    userAgent: req.get("user-agent") ?? null,
    endpoint: `${req.method} ${req.originalUrl}`,
  };
}

/* =========================================================
   SAFE ROLLBACK
========================================================= */

async function rollbackSafely(
  connection: PoolConnection,
): Promise<void> {
  try {
    await connection.rollback();
  } catch {
    // Preserve the original error.
  }
}

/* =========================================================
   GET TRUSTEES
========================================================= */

export async function getTrustees(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;

  try {
    const { organizationId, userTempleId } = getUserScope(req);

    const parsed = trusteeListQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    const result = await trusteeService.list(
      organizationId,
      userTempleId,
      parsed.data,
    );

    connection = await pool.getConnection();

    // await createAuditLog(connection, {
    //   ...getAuditMetadata(req),
    //   action: "VIEW",
    //   module: "trustees",
    //   tableName: "trustees",
    //   description: "Viewed trustees list",
    //   newValues: {
    //     organization_id: organizationId,
    //     temple_id: userTempleId,
    //     query: parsed.data,
    //   },
    // });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    return handleError(res, error);
  } finally {
    connection?.release();
  }
}

/* =========================================================
   GET TRUSTEE BY ID
========================================================= */

export async function getTrusteeById(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;

  try {
    const { organizationId, userTempleId } = getUserScope(req);

    const parsedId = trusteeIdSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid trustee ID",
      });
    }

    const trustee = await trusteeService.getById(
      organizationId,
      userTempleId,
      parsedId.data,
    );

    connection = await pool.getConnection();

    // await createAuditLog(connection, {
    //   ...getAuditMetadata(req),
    //   action: "VIEW",
    //   module: "trustees",
    //   tableName: "trustees",
    //   recordId: parsedId.data,
    //   description: "Viewed trustee details",
    //   newValues: trustee,
    // });

    return res.status(200).json({
      success: true,
      data: trustee,
    });
  } catch (error: unknown) {
    return handleError(res, error);
  } finally {
    connection?.release();
  }
}

/* =========================================================
   CREATE TRUSTEE
========================================================= */

export async function createTrustee(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const { organizationId, userTempleId } = getUserScope(req);

    const parsed = createTrusteeSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    if (
      userTempleId !== null &&
      parsed.data.temple_id != null &&
      parsed.data.temple_id !== userTempleId
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot create a trustee for another temple",
      });
    }

    const payload = {
      ...parsed.data,
      temple_id:
        userTempleId !== null
          ? userTempleId
          : parsed.data.temple_id,
    };

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    // The service must use this connection for its INSERT query.
    const trustee = await trusteeService.create(
      organizationId,
      userTempleId,
      payload,
    );

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "CREATE",
      module: "trustees",
      tableName: "trustees",
      recordId: trustee.id,
      description: "Created trustee",
      newValues: trustee,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "Trustee created successfully",
      data: trustee,
    });
  } catch (error: unknown) {
    if (connection && transactionStarted) {
      await rollbackSafely(connection);
    }

    return handleError(res, error);
  } finally {
    connection?.release();
  }
}

/* =========================================================
   UPDATE TRUSTEE
========================================================= */

export async function updateTrustee(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const { organizationId, userTempleId } = getUserScope(req);

    const parsedId = trusteeIdSchema.safeParse(req.params.id);
    const parsed = updateTrusteeSchema.safeParse(req.body);

    if (!parsedId.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid trustee ID",
      });
    }

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    if (
      userTempleId !== null &&
      parsed.data.temple_id !== undefined &&
      parsed.data.temple_id !== userTempleId
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot move a trustee to another temple",
      });
    }

    const payload =
      userTempleId !== null
        ? {
            ...parsed.data,
            temple_id: userTempleId,
          }
        : parsed.data;

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    // Read the old data for the audit trail.
    const oldTrustee = await trusteeService.getById(
      organizationId,
      userTempleId,
      parsedId.data,
    );

    const trustee = await trusteeService.update(
      organizationId,
      userTempleId,
      parsedId.data,
      payload,
    );

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "UPDATE",
      module: "trustees",
      tableName: "trustees",
      recordId: parsedId.data,
      description: "Updated trustee",
      oldValues: oldTrustee,
      newValues: trustee,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Trustee updated successfully",
      data: trustee,
    });
  } catch (error: unknown) {
    if (connection && transactionStarted) {
      await rollbackSafely(connection);
    }

    return handleError(res, error);
  } finally {
    connection?.release();
  }
}

/* =========================================================
   DELETE TRUSTEE
========================================================= */

export async function deleteTrustee(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const { organizationId, userTempleId } = getUserScope(req);

    const parsedId = trusteeIdSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid trustee ID",
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    // Capture the trustee before deleting it.
    const oldTrustee = await trusteeService.getById(
      organizationId,
      userTempleId,
      parsedId.data,
    );

    await trusteeService.remove(
      organizationId,
      userTempleId,
      parsedId.data,
    );

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "DELETE",
      module: "trustees",
      tableName: "trustees",
      recordId: parsedId.data,
      description: "Deleted trustee",
      oldValues: oldTrustee,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Trustee deleted successfully",
    });
  } catch (error: unknown) {
    if (connection && transactionStarted) {
      await rollbackSafely(connection);
    }

    return handleError(res, error);
  } finally {
    connection?.release();
  }
}
