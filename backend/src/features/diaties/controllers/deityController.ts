




import type { Request, Response } from "express";
import type { PoolConnection } from "mysql2/promise";

import pool from "../../../config/database";
import { createAuditLog } from "../../../utils/auditLog";

import {
  createDeityService,
  deleteDeityService,
  getDeitiesService,
  getDeityService,
  updateDeityService,
} from "../services/deityService";

import {
  createDeitySchema,
  updateDeitySchema,
} from "../validations/deityValidation";

import { handleDeityError } from "../validations/deityErrors";
import type { DeityAccessScope } from "../repositories/deityRepository";



interface AuditMetadata {
  userId: number;
  organizationId: number | null;
  templeId: number | null;
  ipAddress: string | null;
  userAgent: string | null;
  endpoint: string;
}

function getOrganizationId(req: Request): number {
  const organizationId = req.user?.organization_id;

  if (
    typeof organizationId !== "number" ||
    !Number.isSafeInteger(organizationId) ||
    organizationId <= 0
  ) {
    throw new Error("Organization ID not found");
  }

  return organizationId;
}

function getId(req: Request): number {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid deity ID");
  }

  return id;
}

function getAuditMetadata(req: Request): AuditMetadata {
  const userId = req.user?.id;

  if (
    typeof userId !== "number" ||
    !Number.isSafeInteger(userId) ||
    userId <= 0
  ) {
    throw new Error("Authenticated user ID not found");
  }

  const organizationId = req.user?.organization_id;
  const templeId = req.user?.temple_id;

  return {
    userId,
    organizationId:
      typeof organizationId === "number" ? organizationId : null,
    templeId: typeof templeId === "number" ? templeId : null,
    ipAddress: req.ip ?? null,
    userAgent: req.get("user-agent") ?? null,
    endpoint: `${req.method} ${req.originalUrl}`,
  };
}

function sendControllerError(
  res: Response,
  error: unknown,
  _action: string,
): Response {
  if (error instanceof Error) {
    if (error.message === "Organization ID not found") {
      return res.status(401).json({
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

    if (error.message === "Invalid deity ID") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // const handledError = handleDeityError(error);

  // return res.status(handledError.status).json({
  //   success: false,
  //   message: handledError.message,
  // });
    const { statusCode, message } = handleDeityError(error);

  return res.status(statusCode).json({
    success: false,
    message,
  });
}


async function rollbackSafely(
  connection: PoolConnection,
): Promise<void> {
  try {
    await connection.rollback();
  } catch {
    // Preserve the original error.
  }
}

/**
 * CREATE DEITY
 * POST /api/v1/deities
 */
export const createDeityController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const organizationId = getOrganizationId(req);
    const parsed = createDeitySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const deity = await createDeityService(connection, {
      ...parsed.data,
      organization_id: organizationId,
    });

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "CREATE",
      module: "deities",
      tableName: "deities",
      recordId: deity.id,
      description: "Created deity",
      newValues: deity,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "Deity created successfully",
      data: deity,
    });
  } catch (error: unknown) {
    if (connection && transactionStarted) {
      await rollbackSafely(connection);
    }

    return sendControllerError(res, error, "Create");
  } finally {
    connection?.release();
  }
};

/**
 * GET DEITIES
 * GET /api/v1/deities
 */
export const getDeitiesController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  let connection: PoolConnection | undefined;

  try {
    const organizationId = getOrganizationId(req);
    const rawTempleId = req.user?.temple_id;

    const templeId =
      typeof rawTempleId === "number" ? rawTempleId : null;

    if (
      templeId !== null &&
      (!Number.isSafeInteger(templeId) || templeId <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid temple ID",
      });
    }

    const scope: DeityAccessScope = {
      organizationId,
      templeId,
    };

    connection = await pool.getConnection();

    const deities = await getDeitiesService(connection, scope);

    // await createAuditLog(connection, {
    //   ...getAuditMetadata(req),
    //   action: "VIEW",
    //   module: "deities",
    //   tableName: "deities",
    //   description: "Viewed deities list",
    //   newValues: {
    //     organization_id: organizationId,
    //     temple_id: templeId,
    //     result_count: deities.length,
    //   },
    // });

    return res.status(200).json({
      success: true,
      message: "Deities fetched successfully",
      data: deities,
    });
  } catch (error: unknown) {
    return sendControllerError(res, error, "Fetch");
  } finally {
    connection?.release();
  }
};

/**
 * GET DEITY BY ID
 * GET /api/v1/deities/:id
 */
export const getDeityController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  let connection: PoolConnection | undefined;

  try {
    const organizationId = getOrganizationId(req);
    const id = getId(req);

    connection = await pool.getConnection();

    const deity = await getDeityService(
      connection,
      id,
      organizationId,
    );

    if (!deity) {
      return res.status(404).json({
        success: false,
        message: "Deity not found",
      });
    }

    // await createAuditLog(connection, {
    //   ...getAuditMetadata(req),
    //   action: "VIEW",
    //   module: "deities",
    //   tableName: "deities",
    //   recordId: deity.id,
    //   description: "Viewed deity details",
    //   newValues: deity,
    // });

    return res.status(200).json({
      success: true,
      message: "Deity fetched successfully",
      data: deity,
    });
  } catch (error: unknown) {
    return sendControllerError(res, error, "Fetch");
  } finally {
    connection?.release();
  }
};

/**
 * UPDATE DEITY
 * PUT/PATCH /api/v1/deities/:id
 */
export const updateDeityController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const organizationId = getOrganizationId(req);
    const id = getId(req);
    const parsed = updateDeitySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const oldDeity = await getDeityService(
      connection,
      id,
      organizationId,
    );

    if (!oldDeity) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Deity not found",
      });
    }

    const deity = await updateDeityService(
      connection,
      id,
      organizationId,
      parsed.data,
    );

    if (!deity) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Deity not found",
      });
    }

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "UPDATE",
      module: "deities",
      tableName: "deities",
      recordId: id,
      description: "Updated deity",
      oldValues: oldDeity,
      newValues: deity,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Deity updated successfully",
      data: deity,
    });
  } catch (error: unknown) {
    if (connection && transactionStarted) {
      await rollbackSafely(connection);
    }

    return sendControllerError(res, error, "Update");
  } finally {
    connection?.release();
  }
};

/**
 * DELETE DEITY
 * DELETE /api/v1/deities/:id
 */
export const deleteDeityController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const organizationId = getOrganizationId(req);
    const id = getId(req);

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const oldDeity = await getDeityService(
      connection,
      id,
      organizationId,
    );

    if (!oldDeity) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Deity not found",
      });
    }

    const deleted = await deleteDeityService(
      connection,
      id,
      organizationId,
    );

    if (!deleted) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Deity not found",
      });
    }

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "DELETE",
      module: "deities",
      tableName: "deities",
      recordId: id,
      description: "Deleted deity",
      oldValues: oldDeity,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Deity deleted successfully",
    });
  } catch (error: unknown) {
    if (connection && transactionStarted) {
      await rollbackSafely(connection);
    }

    return sendControllerError(res, error, "Delete");
  } finally {
    connection?.release();
  }
};
