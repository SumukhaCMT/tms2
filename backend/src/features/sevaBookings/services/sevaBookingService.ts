
import type { PoolConnection } from "mysql2/promise";

import {
  createBooking,
  listBookings,
  getBookingById,
  updateBooking,
  updatePayment,
  updateStatus,
  softDeleteBooking,
} from "../repositories/sevaBookingRepository";

import type {
  CreateSevaBookingInput,
  ListSevaBookingsQuery,
  UpdateSevaBookingInput,
  SevaBooking,
  SevaBookingListResult,
  SevaBookingScope,
  // SevaBookingReportQuery,
} from "../sevaBookingTypes";
import {
  getBookingsForReport,
} from "../repositories/sevaBookingRepository";


/**
 * CREATE SEVA BOOKING
 */
export async function createSevaBookingService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  userId: number,
  data: CreateSevaBookingInput,
): Promise<SevaBooking> {
  const templeId =
    userTempleId !== null
      ? userTempleId
      : data.temple_id;

  if (!templeId) {
    throw new Error("Invalid temple ID");
  }

  const scope: SevaBookingScope = {
    temple_id: templeId,
    created_by_user_id: userId,
  };

  const id = await createBooking(
    connection,
    organizationId,
    scope,
    data,
  );

  const booking = await getBookingById(
    connection,
    organizationId,
    userTempleId,
    id,
  );

  if (!booking) {
    throw new Error("Failed to retrieve created Seva Booking");
  }

  return booking;
}

/**
 * LIST SEVA BOOKINGS
 */
export async function getSevaBookingsService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  query: ListSevaBookingsQuery,
): Promise<SevaBookingListResult> {
  return listBookings(
    connection,
    organizationId,
    userTempleId,
    query,
  );
}

/**
 * GET SEVA BOOKING BY ID
 */
export async function getSevaBookingService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
): Promise<SevaBooking | null> {
  return getBookingById(
    connection,
    organizationId,
    userTempleId,
    id,
  );
}

/**
 * UPDATE SEVA BOOKING
 */
export async function updateSevaBookingService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
  data: UpdateSevaBookingInput,
): Promise<SevaBooking | null> {
  const updated = await updateBooking(
    connection,
    organizationId,
    userTempleId,
    id,
    data,
  );

  if (!updated) {
    return null;
  }

  return getBookingById(
    connection,
    organizationId,
    userTempleId,
    id,
  );
}

/**
 * UPDATE PAYMENT
 */
export async function updateSevaBookingPaymentService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
  status: "pending" | "paid" | "failed" | "refunded",
  method?: string | null,
): Promise<SevaBooking | null> {
  const updated = await updatePayment(
    connection,
    organizationId,
    userTempleId,
    id,
    status,
    method,
  );

  if (!updated) {
    return null;
  }

  return getBookingById(
    connection,
    organizationId,
    userTempleId,
    id,
  );
}

/**
 * UPDATE STATUS
 */
export async function updateSevaBookingStatusService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
  status: "booked" | "confirmed" | "completed" | "cancelled",
): Promise<SevaBooking | null> {
  const updated = await updateStatus(
    connection,
    organizationId,
    userTempleId,
    id,
    status,
  );

  if (!updated) {
    return null;
  }

  return getBookingById(
    connection,
    organizationId,
    userTempleId,
    id,
  );
}

/**
 * SOFT DELETE
 */
export async function deleteSevaBookingService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
): Promise<boolean> {
  return softDeleteBooking(
    connection,
    organizationId,
    userTempleId,
    id,
  );
}


export async function exportSevaBookingReportService(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  query: {
    from_date: string;
    to_date: string;
    temple_id?: number;
  },
) {
  const bookings = await getBookingsForReport(
    connection,
    organizationId,
    userTempleId,
    query,
  );

  const summary = bookings.reduce(
    (totals, booking) => {
      const sevaAmount = Number(booking.seva_amount ?? 0);
      const gstAmount = Number(booking.booking_gst_amount ?? 0);
      const totalAmount = Number(booking.booking_total_amount ?? 0);

      totals.total_bookings += 1;
      totals.total_seva_amount += sevaAmount;
      totals.total_gst_amount += gstAmount;
      totals.total_amount += totalAmount;

      if (booking.booking_payment_status === "paid") {
        totals.paid_amount += totalAmount;
      } else if (booking.booking_payment_status === "pending") {
        totals.pending_amount += totalAmount;
      }

      return totals;
    },
    {
      total_bookings: 0,
      total_seva_amount: 0,
      total_gst_amount: 0,
      total_amount: 0,
      paid_amount: 0,
      pending_amount: 0,
    },
  );

  return { bookings, summary };
}