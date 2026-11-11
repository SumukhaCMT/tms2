



import type { Request, Response } from "express";
import type { PoolConnection } from "mysql2/promise";

import pool from "../../../config/database";
import { createAuditLog } from "../../../utils/auditLog";

import {
  createSevaService,
  deleteSevaService,
  getSevaService,
  getSevasService,
  updateSevaService,
} from "../services/sevaService";

import {
  createSevaSchema,
  sevaListQuerySchema,
  updateSevaSchema,
} from "../validations/sevaValidation";

import { handleSevaError } from "../validations/sevaErrors";
import { listTempleId } from "../../../utils/scope";

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
    throw new Error("Invalid seva ID");
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
      error.message === "Invalid temple ID"
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Invalid seva ID") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Authenticated user ID not found") {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  return handleSevaError(error, res);
}

/**
 * POST /api/v1/sevas
 * Create a Seva and its audit record in one transaction.
 */
export async function createSevaController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const { organizationId, userTempleId } = getUserScope(req);
    const validation = createSevaSchema.safeParse(req.body);

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
        message: "You cannot create a Seva for another temple",
      });
    }

    const payload = {
      ...validation.data,
      temple_id:
        userTempleId !== null
          ? userTempleId
          : validation.data.temple_id,
    };

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const seva = await createSevaService(
      connection,
      organizationId,
      userTempleId,
      payload,
    );

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "CREATE",
      module: "seva",
      tableName: "sevas",
      recordId: seva.id,
      description: "Created Seva",
      newValues: {
        seva_name: payload.seva_name,
        temple_id: payload.temple_id,
        seva_amount: payload.seva_amount,
      },
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "Seva created successfully",
      data: seva,
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
 * GET /api/v1/sevas
 */
export async function getSevasController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;

  try {
    const { organizationId, userTempleId } = getUserScope(req);
    const validation = sevaListQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: validation.error.flatten(),
      });
    }

    connection = await pool.getConnection();

    const result = await getSevasService(
      connection,
      organizationId,
      userTempleId,
      { ...validation.data, temple_id: listTempleId(req.user!, validation.data.temple_id) ?? undefined },
    );

    return res.status(200).json({
      success: true,
      message: "Sevas fetched successfully",
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
 * GET /api/v1/sevas/:id
 */
export async function getSevaController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;

  try {
    const { organizationId, userTempleId } = getUserScope(req);
    const id = getId(req);

    connection = await pool.getConnection();

    const seva = await getSevaService(
      connection,
      organizationId,
      userTempleId,
      id,
    );

    if (!seva) {
      return res.status(404).json({
        success: false,
        message: "Seva not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Seva fetched successfully",
      data: seva,
    });
  } catch (error) {
    return sendError(res, error);
  } finally {
    connection?.release();
  }
}

/**
 * PUT /api/v1/sevas/:id
 * Update a Seva and record its before-and-after values.
 */
export async function updateSevaController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const { organizationId, userTempleId } = getUserScope(req);
    const id = getId(req);
    const validation = updateSevaSchema.safeParse(req.body);

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
        message: "You cannot move a Seva to another temple",
      });
    }

    const payload =
      userTempleId !== null
        ? {
          ...validation.data,
          temple_id: userTempleId,
        }
        : validation.data;

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    // Read the original record before updating it.
    const oldSeva = await getSevaService(
      connection,
      organizationId,
      userTempleId,
      id,
    );

    if (!oldSeva) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Seva not found",
      });
    }

    const seva = await updateSevaService(
      connection,
      organizationId,
      userTempleId,
      id,
      payload,
    );

    if (!seva) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Seva not found",
      });
    }

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "UPDATE",
      module: "seva",
      tableName: "sevas",
      recordId: id,
      description: "Updated Seva",
      oldValues: oldSeva,
      newValues: seva,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Seva updated successfully",
      data: seva,
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
 * DELETE /api/v1/sevas/:id
 * Soft-delete a Seva and record the audit event.
 */
export async function deleteSevaController(
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

    const oldSeva = await getSevaService(
      connection,
      organizationId,
      userTempleId,
      id,
    );

    if (!oldSeva) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Seva not found",
      });
    }

    const deleted = await deleteSevaService(
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
        message: "Seva not found",
      });
    }

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "DELETE",
      module: "seva",
      tableName: "sevas",
      recordId: id,
      description: "Soft-deleted Seva",
      oldValues: oldSeva,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Seva deleted successfully",
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
