
import type { Request, Response } from "express";
import type { PoolConnection, RowDataPacket, } from "mysql2/promise";

import pool from "../../../config/database";
import { createAuditLog } from "../../../utils/auditLog";
export interface ReceiptPrintItem {
  name: string;
  deity?: string | null;
  quantity: number;
  rate: number;
  amount: number;
}
export interface ReceiptPrintData {
  receiptNumber:  string | null;
  organizationName: string;
  templeName: string;
  templeAddress?: string | null;
  templePhone?: string | null;
  receiptTitle?: string;
  date: string;
  paymentMethod:  string | null;
  items: ReceiptPrintItem[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  remark?: string | null;
}

import { generateReceiptPrintHtml } from "../../../utils/receipt/receiptPrint";

import {
  createSevaBookingService,
  deleteSevaBookingService,
  getSevaBookingService,
  getSevaBookingsService,
  updateSevaBookingService,
  updateSevaBookingPaymentService,
  updateSevaBookingStatusService,
} from "../services/sevaBookingService";

import {
  createSevaBookingSchema,
  updateSevaBookingSchema,
  sevaBookingListQuerySchema,
  updateSevaBookingPaymentSchema,
  updateSevaBookingStatusSchema,
} from "../validations/sevaBookingValidation";
import { sevaBookingReportQuerySchema } from "../validations/sevaBookingValidation";
import { exportSevaBookingReportService } from "../services/sevaBookingService";
import {
  generateSevaBookingExcel,
  type SevaBookingReportRow,
  type SevaBookingReportSummary,
} from "../reports/sevaBookingExcel";

import { generateSevaBookingPdf } from "../reports/sevaBookingPdf";

import { handleSevaBookingError } from "../validations/sevaBookingErrors";

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
 * USER ID
 */
function getUserId(req: Request): number {
  const userId = Number(req.user?.id);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new Error("Authenticated user ID not found");
  }

  return userId;
}

/**
 * PARAMETER ID
 */
function getId(req: Request): number {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid booking ID");
  }

  return id;
}

/**
 * AUDIT METADATA
 */
function getAuditMetadata(req: Request) {
  return {
    userId: req.user?.id,
    organizationId: req.user?.organization_id ?? null,
    templeId: req.user?.temple_id ?? null,
    ipAddress: req.ip,
    userAgent: req.get("user-agent") ?? null,
    endpoint: `${req.method} ${req.originalUrl}`,
  };
}

/**
 * ERROR HANDLER
 */
function sendError(res: Response, error: unknown) {
  return handleSevaBookingError(error, res);
}

/**
 * POST /api/v1/seva-bookings
 * CREATE BOOKING
 */
export async function createSevaBookingController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const { organizationId, userTempleId } = getUserScope(req);
    const userId = getUserId(req);

    const validation = createSevaBookingSchema.safeParse(req.body);

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
        message: "You cannot create a booking for another temple",
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const booking = await createSevaBookingService(
      connection,
      organizationId,
      userTempleId,
      userId,
      validation.data,
    );

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "CREATE",
      module: "seva_booking",
      tableName: "seva_bookings",
      recordId: booking.id,
      description: "Created Seva Booking",
      newValues: {
        temple_id: booking.temple_id,
        devotee_name: booking.devotee_name,
        seva_name: booking.seva_name,
        seva_amount: booking.seva_amount,
        booking_total_amount: booking.booking_total_amount,
        booking_scheduled_date: booking.booking_scheduled_date,
      },
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "Seva booking created successfully",
      data: booking,
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
 * GET /api/v1/seva-bookings
 * LIST BOOKINGS
 */
export async function getSevaBookingsController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;

  try {
    const { organizationId, userTempleId } = getUserScope(req);

    const validation = sevaBookingListQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: validation.error.flatten(),
      });
    }

    connection = await pool.getConnection();

    const result = await getSevaBookingsService(
      connection,
      organizationId,
      userTempleId,
      validation.data,
    );

    return res.status(200).json({
      success: true,
      message: "Seva bookings fetched successfully",
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
 * GET /api/v1/seva-bookings/:id
 * GET BOOKING
 */
export async function getSevaBookingController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;

  try {
    const { organizationId, userTempleId } = getUserScope(req);
    const id = getId(req);

    connection = await pool.getConnection();

    const booking = await getSevaBookingService(
      connection,
      organizationId,
      userTempleId,
      id,
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Seva booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Seva booking fetched successfully",
      data: booking,
    });
  } catch (error) {
    return sendError(res, error);
  } finally {
    connection?.release();
  }
}

/**
 * PUT /api/v1/seva-bookings/:id
 * UPDATE BOOKING
 */
export async function updateSevaBookingController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const { organizationId, userTempleId } = getUserScope(req);
    const id = getId(req);

    const validation = updateSevaBookingSchema.safeParse(req.body);

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

    const oldBooking = await getSevaBookingService(
      connection,
      organizationId,
      userTempleId,
      id,
    );

    if (!oldBooking) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Seva booking not found",
      });
    }

    const booking = await updateSevaBookingService(
      connection,
      organizationId,
      userTempleId,
      id,
      validation.data,
    );

    if (!booking) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Seva booking not found",
      });
    }

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "UPDATE",
      module: "seva_booking",
      tableName: "seva_bookings",
      recordId: id,
      description: "Updated Seva Booking",
      oldValues: oldBooking,
      newValues: booking,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Seva booking updated successfully",
      data: booking,
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
 * PATCH /api/v1/seva-bookings/:id/payment
 * UPDATE PAYMENT
 */
export async function updateSevaBookingPaymentController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const { organizationId, userTempleId } = getUserScope(req);
    const id = getId(req);

    const validation =
      updateSevaBookingPaymentSchema.safeParse(req.body);

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

    const oldBooking = await getSevaBookingService(
      connection,
      organizationId,
      userTempleId,
      id,
    );

    if (!oldBooking) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Seva booking not found",
      });
    }

    const booking = await updateSevaBookingPaymentService(
      connection,
      organizationId,
      userTempleId,
      id,
      validation.data.booking_payment_status,
      validation.data.booking_payment_method,
    );

    if (!booking) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Seva booking not found",
      });
    }

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "UPDATE",
      module: "seva_booking",
      tableName: "seva_bookings",
      recordId: id,
      description: "Updated Seva Booking Payment",
      oldValues: {
        booking_payment_status: oldBooking.booking_payment_status,
        booking_payment_method: oldBooking.booking_payment_method,
      },
      newValues: {
        booking_payment_status: booking.booking_payment_status,
        booking_payment_method: booking.booking_payment_method,
      },
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Seva booking payment updated successfully",
      data: booking,
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
 * PATCH /api/v1/seva-bookings/:id/status
 * UPDATE STATUS
 */
export async function updateSevaBookingStatusController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;
  let transactionStarted = false;

  try {
    const { organizationId, userTempleId } = getUserScope(req);
    const id = getId(req);

    const validation =
      updateSevaBookingStatusSchema.safeParse(req.body);

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

    const oldBooking = await getSevaBookingService(
      connection,
      organizationId,
      userTempleId,
      id,
    );

    if (!oldBooking) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Seva booking not found",
      });
    }

    const booking = await updateSevaBookingStatusService(
      connection,
      organizationId,
      userTempleId,
      id,
      validation.data.booking_status,
    );

    if (!booking) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Seva booking not found",
      });
    }

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "UPDATE",
      module: "seva_booking",
      tableName: "seva_bookings",
      recordId: id,
      description: "Updated Seva Booking Status",
      oldValues: {
        booking_status: oldBooking.booking_status,
      },
      newValues: {
        booking_status: booking.booking_status,
      },
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Seva booking status updated successfully",
      data: booking,
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
 * DELETE /api/v1/seva-bookings/:id
 * SOFT DELETE
 */
export async function deleteSevaBookingController(
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

    const oldBooking = await getSevaBookingService(
      connection,
      organizationId,
      userTempleId,
      id,
    );

    if (!oldBooking) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "Seva booking not found",
      });
    }

    const deleted = await deleteSevaBookingService(
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
        message: "Seva booking not found",
      });
    }

    await createAuditLog(connection, {
      ...getAuditMetadata(req),
      action: "DELETE",
      module: "seva_booking",
      tableName: "seva_bookings",
      recordId: id,
      description: "Soft-deleted Seva Booking",
      oldValues: oldBooking,
    });

    await connection.commit();
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Seva booking deleted successfully",
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
 * GET /api/v1/seva-bookings/:id/receipt/print
 * GENERATE SEVA BOOKING RECEIPT HTML
 */
export async function printSevaBookingReceiptController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;

  try {
    const { organizationId, userTempleId } = getUserScope(req);
    const id = getId(req);

    connection = await pool.getConnection();

    // Fetch booking using organization and temple scope.
    const booking = await getSevaBookingService(
      connection,
      organizationId,
      userTempleId,
      id,
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Seva booking not found",
      });
    }

    // Fetch temple details.
    const [temples] = await connection.execute<
      Array<{
        temp_name: string;
        temp_phone: string | null;
      } & import("mysql2/promise").RowDataPacket>
    >(
      `
        SELECT temp_name, temp_phone
        FROM temples
        WHERE id = ?
          AND organization_id = ?
          AND deleted_at IS NULL
        LIMIT 1
      `,
      [booking.temple_id, organizationId],
    );

    if (!temples.length) {
      return res.status(404).json({
        success: false,
        message: "Temple not found",
      });
    }

    const temple = temples[0];

    const bookingDate = booking.created_at
      ? new Date(booking.created_at).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date().toLocaleString("en-IN");

    // Convert booking into receipt data.
    const receiptData: ReceiptPrintData = {
      receiptNumber: booking.booking_receipt_number,
      organizationName: "",
      templeName: temple.temp_name,
      templePhone: temple.temp_phone,
      receiptTitle: "SEVA BOOKING RECEIPT",
      date: bookingDate,
      paymentMethod: booking.booking_payment_method,
      items: [
        {
          name: booking.seva_name,
          deity: booking.deity_name,
          quantity: 1,
          rate: Number(booking.seva_amount),
          amount: Number(booking.seva_amount),
        },
      ],
      subtotal: Number(booking.seva_amount),
      gstAmount: Number(booking.booking_gst_amount),
      totalAmount: Number(booking.booking_total_amount),
      remark: booking.booking_remark,
    };

    const result = await generateReceiptPrintHtml(
      connection,
      organizationId,
      booking.temple_id,
      receiptData,
    );

    return res.status(200).json({
      success: true,
      message: "Seva booking receipt generated successfully",
      data: {
        html: result.html,
        printType: result.printType,
      },
    });
  } catch (error) {
    return sendError(res, error);
  } finally {
    connection?.release();
  }
}


interface TempleReportRow extends RowDataPacket {
  id: number;
  temp_name: string;
}

function formatReportDate(value: unknown): string {
  if (!value) return "";

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function formatReportTime(value: unknown): string {
  if (!value) return "";
  return String(value).slice(0, 8);
}

export async function exportSevaBookingReportController(
  req: Request,
  res: Response,
) {
  let connection: PoolConnection | undefined;

  try {
    const { organizationId, userTempleId } = getUserScope(req);

    const validation = sevaBookingReportQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid report parameters",
        errors: validation.error.flatten(),
      });
    }

    const { from_date, to_date, format, temple_id } = validation.data;

    // Temple-scoped users cannot export another temple's data.
    if (
      userTempleId !== null &&
      temple_id !== undefined &&
      temple_id !== userTempleId
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot export another temple's report",
      });
    }

    connection = await pool.getConnection();

    const result = await exportSevaBookingReportService(
      connection,
      organizationId,
      userTempleId,
      {
        from_date,
        to_date,
        temple_id,
      },
    );

    const bookings: SevaBookingReportRow[] = result.bookings.map(
      (booking) => ({
        receiptNumber: booking.booking_receipt_number ?? "",
        bookingDate: formatReportDate(booking.booking_scheduled_date),
        bookingTime: formatReportTime(booking.booking_scheduled_time),
        devoteeName: booking.devotee_name ?? "",
        devoteePhone: booking.devotee_phone ?? "",
        sevaName: booking.seva_name ?? "",
        deityName: booking.deity_name ?? "",
        sevaAmount: Number(booking.seva_amount ?? 0),
        gstAmount: Number(booking.booking_gst_amount ?? 0),
        totalAmount: Number(booking.booking_total_amount ?? 0),
        paymentStatus: booking.booking_payment_status ?? "",
        paymentMethod: booking.booking_payment_method ?? "",
        bookingStatus: booking.booking_status ?? "",
        remarks: booking.booking_remark ?? "",
      }),
    );

    // Get temple names for the report heading.
    const templeIds = [
      ...new Set(
        result.bookings.map((booking) => Number(booking.temple_id)),
      ),
    ];

    if (temple_id !== undefined) {
      templeIds.push(temple_id);
    }

    const uniqueTempleIds = [...new Set(templeIds)];

    let templeName = "All Temples";

    if (uniqueTempleIds.length > 0) {
      const placeholders = uniqueTempleIds.map(() => "?").join(", ");

      const [temples] = await connection.execute<TempleReportRow[]>(
        `
          SELECT id, temp_name
          FROM temples
          WHERE organization_id = ?
            AND id IN (${placeholders})
            AND deleted_at IS NULL
        `,
        [organizationId, ...uniqueTempleIds],
      );

      templeName =
        temples.length === 1
          ? temples[0].temp_name
          : temples.length > 1
            ? "Multiple Temples"
            : "All Temples";
    }

    const summary: SevaBookingReportSummary = {
      totalBookings: Number(result.summary.total_bookings ?? 0),
      totalSevaAmount: Number(result.summary.total_seva_amount ?? 0),
      totalGstAmount: Number(result.summary.total_gst_amount ?? 0),
      totalAmount: Number(result.summary.total_amount ?? 0),
      paidAmount: Number(result.summary.paid_amount ?? 0),
      pendingAmount: Number(result.summary.pending_amount ?? 0),
    };

    const generatedAt = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const reportOptions = {
      templeName,
      fromDate: from_date,
      toDate: to_date,
      generatedAt,
      bookings,
      summary,
    };

    const filename = `seva-booking-report-${from_date}-to-${to_date}`;

    if (format === "excel") {
      const file = await generateSevaBookingExcel(reportOptions);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.xlsx"`,
      );

      return res.status(200).send(file);
    }

    const file = await generateSevaBookingPdf(reportOptions);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}.pdf"`,
    );

    return res.status(200).send(file);
  } catch (error) {
    return sendError(res, error);
  } finally {
    connection?.release();
  }
}