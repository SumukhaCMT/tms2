

import type { Request, Response } from "express";
import type { PoolConnection } from "mysql2/promise";

import pool from "../../../config/database";
import { createAuditLog } from "../../../utils/auditLog";

import {
  getDevoteesService,
  getDevoteeService,
  updateDevoteeService,
    deleteDevoteeService,
} from "../services/devoteeService";

import {
  devoteeListQuerySchema,
  updateDevoteeSchema,
} from "../validations/devoteeValidation";

/**
 * USER SCOPE
 */
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

  return {
    organizationId,
    userTempleId,
  };
}

/**
 * VALIDATE ID
 */
function getDevoteeId(req: Request): number {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid devotee ID");
  }

  return id;
}

/**
 * AUDIT METADATA
 */
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

/**
 * ERROR HANDLER
 */
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

    if (error.message === "Invalid devotee ID") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Temple not found") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  console.error("Devotee error:", error);

  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
}

/**
 * GET /api/v1/devotees
 *
 * Get all devotees with pagination and search.
 */
export async function getDevoteesController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;

  try {
    const { organizationId, userTempleId } = getUserScope(req);

    const validation = devoteeListQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: validation.error.flatten(),
      });
    }

    connection = await pool.getConnection();

    const result = await getDevoteesService(
      connection,
      organizationId,
      userTempleId,
      validation.data,
    );

    return res.status(200).json({
      success: true,
      message: "Devotees fetched successfully",
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
 * GET /api/v1/devotees/search?search=...
 *
 * Search by name, email or phone.
 *
 * Minimum 3 characters.
 */
export async function searchDevoteesController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;

  try {
    const { organizationId, userTempleId } = getUserScope(req);

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    if (search.length < 3) {
      return res.status(200).json({
        success: true,
        message: "Enter at least 3 characters",
        data: [],
      });
    }

    connection = await pool.getConnection();

    const result = await getDevoteesService(
      connection,
      organizationId,
      userTempleId,
      {
        page: 1,
        limit: 20,
        search,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Devotees searched successfully",
      data: result.data,
    });
  } catch (error) {
    return sendError(res, error);
  } finally {
    connection?.release();
  }
}

/**
 * GET /api/v1/devotees/:id
 *
 * Get one devotee.
 */
export async function getDevoteeController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;

  try {
    const { organizationId, userTempleId } = getUserScope(req);

    const id = getDevoteeId(req);

    connection = await pool.getConnection();

    const devotee = await getDevoteeService(
      connection,
      organizationId,
      userTempleId,
      id,
    );

    if (!devotee) {
      return res.status(404).json({
        success: false,
        message: "Devotee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Devotee fetched successfully",
      data: devotee,
    });
  } catch (error) {
    return sendError(res, error);
  } finally {
    connection?.release();
  }
}

/**
 * PUT /api/v1/devotees/:id
 *
 * Update devotee and create audit record.
 */
export async function updateDevoteeController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const { organizationId, userTempleId } = getUserScope(req);

    const id = getDevoteeId(req);

    const validation = updateDevoteeSchema.safeParse(req.body);

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
        message: "You cannot move a devotee to another temple",
      });
    }

    connection = await pool.getConnection();

    await connection.beginTransaction();
    transactionStarted = true;

    // Fetch original devotee for audit.
    const oldDevotee = await getDevoteeService(
      connection,
      organizationId,
      userTempleId,
      id,
    );

    if (!oldDevotee) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Devotee not found",
      });
    }

    const devotee = await updateDevoteeService(
      connection,
      organizationId,
      userTempleId,
      id,
      validation.data,
    );

    if (!devotee) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Devotee not found",
      });
    }

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "UPDATE",
      module: "devotees",
      tableName: "devotees",
      recordId: id,
      description: "Updated Devotee",
      oldValues: oldDevotee,
      newValues: devotee,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Devotee updated successfully",
      data: devotee,
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
 * DELETE /api/v1/devotees/:id
 *
 * Soft delete devotee and create audit record.
 */
export async function deleteDevoteeController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const { organizationId, userTempleId } = getUserScope(req);
    const id = getDevoteeId(req);

    connection = await pool.getConnection();

    await connection.beginTransaction();
    transactionStarted = true;

    const deletedDevotee = await deleteDevoteeService(
      connection,
      organizationId,
      userTempleId,
      id,
    );

    if (!deletedDevotee) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Devotee not found",
      });
    }

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "DELETE",
      module: "devotees",
      tableName: "devotees",
      recordId: id,
      description: "Deleted Devotee",
      oldValues: deletedDevotee,
      newValues: null,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Devotee deleted successfully",
      data: deletedDevotee,
    });
  } catch (error) {
    if (connection && transactionStarted) {
      await connection.rollback();
    }

    return sendError(res, error);
  } finally {
    connection?.release();
  }
}