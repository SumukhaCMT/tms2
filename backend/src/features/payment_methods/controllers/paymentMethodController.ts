

import type { Request, Response } from "express";
import type { PoolConnection } from "mysql2/promise";

import pool from "../../../config/database";
import { createAuditLog } from "../../../utils/auditLog";

import {
  createPaymentMethodService,
  deletePaymentMethodService,
  getPaymentMethodService,
  getPaymentMethodsService,
  updatePaymentMethodService,
} from "../services/paymentMethodService";

import {
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
} from "../validations/paymentMethodValidation";

import { handlePaymentMethodError } from "../validations/paymentMethodErrors";

interface AuditMetadata {
  userId: number;
  organizationId: number | null;
  templeId: number | null;
  ipAddress: string | null;
  userAgent: string | null;
  endpoint: string;
}

const getOrganizationId = (req: Request): number => {
  const organizationId = req.user?.organization_id;

  if (
    typeof organizationId !== "number" ||
    !Number.isSafeInteger(organizationId) ||
    organizationId <= 0
  ) {
    throw new Error("Organization ID not found");
  }

  return organizationId;
};

const getId = (req: Request): number => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid payment method ID");
  }

  return id;
};

const getAuditMetadata = (req: Request): AuditMetadata => {
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
};

const sendControllerError = (
  res: Response,
  error: unknown,
): Response => {
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

    if (error.message === "Invalid payment method ID") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  const handled = handlePaymentMethodError(error);

  return res.status(handled.statusCode).json({
    success: false,
    message: handled.message,
  });
};

const rollbackSafely = async (
  connection: PoolConnection,
): Promise<void> => {
  try {
    await connection.rollback();
  } catch {
    // Preserve the original error.
  }
};

/**
 * CREATE PAYMENT METHOD
 */
export const createPaymentMethodController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const organizationId = getOrganizationId(req);
    const parsed = createPaymentMethodSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message:
          parsed.error.issues[0]?.message ??
          "Invalid payment method data",
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    // The service must accept this connection as its first argument
    // and use it for all queries within this transaction.
   

          const paymentMethod =
        await createPaymentMethodService({
          ...parsed.data,
          organization_id:
            organizationId,
        });
    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "CREATE",
      module: "payment_methods",
      tableName: "payment_methods",
      recordId: paymentMethod.id,
      description: "Created payment method",
      newValues: paymentMethod,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "Payment method created successfully",
      data: paymentMethod,
    });
  } catch (error: unknown) {
    if (connection && transactionStarted) {
      await rollbackSafely(connection);
    }

    return sendControllerError(res, error);
  } finally {
    connection?.release();
  }
};

/**
 * GET ALL PAYMENT METHODS
 */
export const getPaymentMethodsController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  let connection: PoolConnection | undefined;

  try {
    const organizationId = getOrganizationId(req);

    connection = await pool.getConnection();

    const paymentMethods = await getPaymentMethodsService(
      organizationId,
    );

    // await createAuditLog(connection, {
    //   ...getAuditMetadata(req),
    //   action: "VIEW",
    //   module: "payment_methods",
    //   tableName: "payment_methods",
    //   description: "Viewed payment methods list",
    //   newValues: {
    //     organization_id: organizationId,
    //     result_count: paymentMethods.length,
    //   },
    // });

    return res.status(200).json({
      success: true,
      message: "Payment methods fetched successfully",
      data: paymentMethods,
    });
  } catch (error: unknown) {
    return sendControllerError(res, error);
  } finally {
    connection?.release();
  }
};

/**
 * GET PAYMENT METHOD BY ID
 */
export const getPaymentMethodController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  let connection: PoolConnection | undefined;

  try {
    const organizationId = getOrganizationId(req);
    const id = getId(req);

    connection = await pool.getConnection();

    const paymentMethod = await getPaymentMethodService(
      id,
      organizationId,
    );

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
    }

    // await createAuditLog(connection, {
    //   ...getAuditMetadata(req),
    //   action: "VIEW",
    //   module: "payment_methods",
    //   tableName: "payment_methods",
    //   recordId: paymentMethod.id,
    //   description: "Viewed payment method details",
    //   newValues: paymentMethod,
    // });

    return res.status(200).json({
      success: true,
      message: "Payment method fetched successfully",
      data: paymentMethod,
    });
  } catch (error: unknown) {
    return sendControllerError(res, error);
  } finally {
    connection?.release();
  }
};

/**
 * UPDATE PAYMENT METHOD
 */
export const updatePaymentMethodController = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const organizationId = getOrganizationId(req);
    const id = getId(req);
    const parsed = updatePaymentMethodSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message:
          parsed.error.issues[0]?.message ??
          "Invalid payment method data",
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    // Fetch the old values before updating.
    const oldPaymentMethod = await getPaymentMethodService(
      id,
      organizationId,
    );

    if (!oldPaymentMethod) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
    }

    const paymentMethod = await updatePaymentMethodService(
      id,
      organizationId,
      parsed.data,
    );

    if (!paymentMethod) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
    }

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "UPDATE",
      module: "payment_methods",
      tableName: "payment_methods",
      recordId: id,
      description: "Updated payment method",
      oldValues: oldPaymentMethod,
      newValues: paymentMethod,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Payment method updated successfully",
      data: paymentMethod,
    });
  } catch (error: unknown) {
    if (connection && transactionStarted) {
      await rollbackSafely(connection);
    }

    return sendControllerError(res, error);
  } finally {
    connection?.release();
  }
};

/**
 * DELETE PAYMENT METHOD
 */
export const deletePaymentMethodController = async (
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

    // Capture the record before deletion for the audit trail.
    const oldPaymentMethod = await getPaymentMethodService(
      id,
      organizationId,
    );

    if (!oldPaymentMethod) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
    }

    const deleted = await deletePaymentMethodService(
      id,
      organizationId,
    );

    if (!deleted) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
    }

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "DELETE",
      module: "payment_methods",
      tableName: "payment_methods",
      recordId: id,
      description: "Deleted payment method",
      oldValues: oldPaymentMethod,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error: unknown) {
    if (connection && transactionStarted) {
      await rollbackSafely(connection);
    }

    return sendControllerError(res, error);
  } finally {
    connection?.release();
  }
};
