


import { searchTerm } from "../../../utils/search";

import type { Request, Response } from "express";
import type { PoolConnection } from "mysql2/promise";

import pool from "../../../config/database";
import { createAuditLog } from "../../../utils/auditLog";

import { handleTempleError } from "../validations/templeErrors";
import type { TempleAccessScope } from "../repositories/templeRepository";

import {
  createTempleService,
  deleteTempleService,
  getTempleLimitService,
  getTempleService,
  getTemplesService,
  updateTempleService,
} from "../services/templeService";

import {
  createTempleSchema,
  updateTempleSchema,
} from "../validations/templeValidation";

interface AuditMetadata {
  userId: number;
  organizationId: number | null;
  templeId: number | null;
  ipAddress: string | null;
  userAgent: string | null;
  endpoint: string;
}

/* =========================================================
   GET ORGANIZATION ID
========================================================= */

function getOrganizationId(req: Request): number {
  const organizationId = req.user?.organization_id;

  if (
    organizationId === null ||
    organizationId === undefined
  ) {
    throw new Error("Organization ID not found");
  }

  const id = Number(organizationId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid organization ID");
  }

  return id;
}

/* =========================================================
   GET TEMPLE ID
========================================================= */

function getId(req: Request): number {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid temple ID");
  }

  return id;
}

/* =========================================================
   AUDIT METADATA
========================================================= */

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
      organizationId == null ? null : Number(organizationId),
    templeId: templeId == null ? null : Number(templeId),
    ipAddress: req.ip ?? null,
    userAgent: req.get("user-agent") ?? null,
    endpoint: `${req.method} ${req.originalUrl}`,
  };
}

/* =========================================================
   ERROR HANDLER
========================================================= */

function handleControllerError(
  error: unknown,
  res: Response,
) {
  if (error instanceof Error) {
    if (
      error.message === "Organization ID not found" ||
      error.message === "Authenticated user ID not found"
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "Invalid organization ID" ||
      error.message === "Invalid temple ID"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  return handleTempleError(error, res);
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
   CREATE TEMPLE
========================================================= */

export async function createTempleController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const organizationId = getOrganizationId(req);

    const validation = createTempleSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
    }

    connection = await pool.getConnection();

    await connection.beginTransaction();
    transactionStarted = true;

    const temple = await createTempleService(
      connection,
      organizationId,
      validation.data,
    );
if (!temple) {
  throw new Error("Temple not found");
}
    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "CREATE",
      module: "temples",
      tableName: "temples",
      recordId: temple.id,
      description: "Created temple",
      newValues: temple,
    });



    await connection.commit();
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "Temple created successfully",
      data: temple,
    });
  } catch (error: unknown) {
    if (connection && transactionStarted) {
      await rollbackSafely(connection);
    }

    return handleControllerError(error, res);
  } finally {
    connection?.release();
  }
}

/* =========================================================
   GET ALL TEMPLES
========================================================= */

export async function getTemplesController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;

  try {
    const organizationId = getOrganizationId(req);

    const rawTempleId = req.user?.temple_id;

    const templeId =
      rawTempleId == null ? null : Number(rawTempleId);

    if (
      templeId !== null &&
      (!Number.isSafeInteger(templeId) || templeId <= 0)
    ) {
      throw new Error("Invalid temple ID");
    }

    const scope: TempleAccessScope = {
      organizationId,
      templeId,
    };

    connection = await pool.getConnection();

    const temples = await getTemplesService(
      connection,
      scope,
      searchTerm(req.query.search),
    );

    // await createAuditLog(connection, {
    //   ...getAuditMetadata(req),
    //   action: "VIEW",
    //   module: "temples",
    //   tableName: "temples",
    //   description: "Viewed temples list",
    //   newValues: {
    //     organization_id: organizationId,
    //     temple_id: templeId,
    //     search: req.query.search
    //       ? String(req.query.search)
    //       : null,
    //   },
    // });

    return res.status(200).json({
      success: true,
      message: "Temples fetched successfully",
      data: temples,
    });
  } catch (error: unknown) {
    return handleControllerError(error, res);
  } finally {
    connection?.release();
  }
}

export async function getTempleLimitController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;
  try {
    const organizationId = getOrganizationId(req);
    connection = await pool.getConnection();
    const data = await getTempleLimitService(connection, organizationId);
    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    return handleControllerError(error, res);
  } finally {
    connection?.release();
  }
}

/* =========================================================
   GET SINGLE TEMPLE
========================================================= */

export async function getTempleController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;

  try {
    const organizationId = getOrganizationId(req);
    const id = getId(req);

    connection = await pool.getConnection();

    const temple = await getTempleService(
      connection,
      organizationId,
      id,
    );

    if (!temple) {
      return res.status(404).json({
        success: false,
        message: "Temple not found",
      });
    }

    // await createAuditLog(connection, {
    //   ...getAuditMetadata(req),
    //   action: "VIEW",
    //   module: "temples",
    //   tableName: "temples",
    //   recordId: id,
    //   description: "Viewed temple details",
    //   newValues: temple,
    // });

    return res.status(200).json({
      success: true,
      message: "Temple fetched successfully",
      data: temple,
    });
  } catch (error: unknown) {
    return handleControllerError(error, res);
  } finally {
    connection?.release();
  }
}

/* =========================================================
   UPDATE TEMPLE
========================================================= */

export async function updateTempleController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const organizationId = getOrganizationId(req);
    const id = getId(req);

    const validation = updateTempleSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
    }

    connection = await pool.getConnection();

    await connection.beginTransaction();
    transactionStarted = true;

    // Capture the original record before updating it.
    const oldTemple = await getTempleService(
      connection,
      organizationId,
      id,
    );

    if (!oldTemple) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Temple not found",
      });
    }

    const temple = await updateTempleService(
      connection,
      organizationId,
      id,
      validation.data,
    );

    if (!temple) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Temple not found",
      });
    }

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "UPDATE",
      module: "temples",
      tableName: "temples",
      recordId: id,
      description: "Updated temple",
      oldValues: oldTemple,
      newValues: temple,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Temple updated successfully",
      data: temple,
    });
  } catch (error: unknown) {
    if (connection && transactionStarted) {
      await rollbackSafely(connection);
    }

    return handleControllerError(error, res);
  } finally {
    connection?.release();
  }
}

/* =========================================================
   DELETE TEMPLE
========================================================= */

export async function deleteTempleController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const organizationId = getOrganizationId(req);
    const id = getId(req);

    connection = await pool.getConnection();

    await connection.beginTransaction();
    transactionStarted = true;

    // Capture the original record before deletion.
    const oldTemple = await getTempleService(
      connection,
      organizationId,
      id,
    );

    if (!oldTemple) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Temple not found",
      });
    }

    const deleted = await deleteTempleService(
      connection,
      organizationId,
      id,
    );

    if (!deleted) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Temple not found",
      });
    }

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "DELETE",
      module: "temples",
      tableName: "temples",
      recordId: id,
      description: "Deleted temple",
      oldValues: oldTemple,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Temple deleted successfully",
    });
  } catch (error: unknown) {
    if (connection && transactionStarted) {
      await rollbackSafely(connection);
    }

    return handleControllerError(error, res);
  } finally {
    connection?.release();
  }
}

