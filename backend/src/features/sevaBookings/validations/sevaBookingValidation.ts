
import { z } from "zod";

const dateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  "Date must be in YYYY-MM-DD format.",
);

const timeSchema = z.string().regex(
  /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/,
  "Time must be in HH:mm:ss format.",
);

/**
 * CREATE BOOKING
 */
export const createSevaBookingSchema = z.object({
  temple_id: z.coerce.number().int().positive().optional(),

  booking_type: z.literal("one_time").default("one_time"),

  devotee_id: z.coerce.number().int().positive().nullable().optional(),

  devotee_name: z.string().trim().max(150).nullable().optional(),
  devotee_phone: z.string().trim().max(20).nullable().optional(),
  devotee_email: z.string().trim().email().max(150).nullable().optional(),

  devotee_gotra: z.string().trim().max(100).nullable().optional(),
  devotee_rashi: z.string().trim().max(50).nullable().optional(),
  devotee_nakshatra: z.string().trim().max(50).nullable().optional(),

  deity_name: z.string().trim().max(150).nullable().optional(),
  deity_code: z.string().trim().max(50).nullable().optional(),

  seva_code: z.string().trim().min(1).max(50),

  booking_scheduled_date: dateSchema,

  booking_scheduled_time: timeSchema.nullable().optional(),

  booking_remark: z.string().trim().max(500).nullable().optional(),

  booking_internal_note: z.string().trim().max(500).nullable().optional(),
}).strict();

/**
 * UPDATE BOOKING
 */
export const updateSevaBookingSchema = z.object({
  devotee_id: z.coerce.number().int().positive().nullable().optional(),

  devotee_name: z.string().trim().max(150).nullable().optional(),
  devotee_phone: z.string().trim().max(20).nullable().optional(),
  devotee_email: z.string().trim().email().max(150).nullable().optional(),

  devotee_gotra: z.string().trim().max(100).nullable().optional(),
  devotee_rashi: z.string().trim().max(50).nullable().optional(),
  devotee_nakshatra: z.string().trim().max(50).nullable().optional(),

  booking_scheduled_date: dateSchema.optional(),

  booking_scheduled_time: timeSchema.nullable().optional(),

  booking_remark: z.string().trim().max(500).nullable().optional(),

  booking_internal_note: z.string().trim().max(500).nullable().optional(),
}).strict().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required." },
);

/**
 * UPDATE PAYMENT
 */
export const updateSevaBookingPaymentSchema = z.object({
  booking_payment_status: z.enum([
    "pending",
    "paid",
    "failed",
    "refunded",
  ]),

  booking_payment_method: z.string().trim().max(50).nullable().optional(),
}).strict().refine(
  (data) =>
    data.booking_payment_status !== "paid" ||
    Boolean(data.booking_payment_method?.trim()),
  {
    message: "Payment method is required when payment is paid.",
  },
);

/**
 * UPDATE BOOKING STATUS
 */
export const updateSevaBookingStatusSchema = z.object({
  booking_status: z.enum([
    "booked",
    "confirmed",
    "completed",
    "cancelled",
  ]),
}).strict();

/**
 * LIST BOOKINGS
 */
export const sevaBookingListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().trim().max(150).default(""),

  temple_id: z.coerce.number().int().positive().optional(),

  booking_payment_status: z.enum([
    "pending",
    "paid",
    "failed",
    "refunded",
  ]).optional(),

  booking_status: z.enum([
    "booked",
    "confirmed",
    "completed",
    "cancelled",
  ]).optional(),

  from_date: dateSchema.optional(),
  to_date: dateSchema.optional(),
}).refine(
  (data) =>
    !data.from_date ||
    !data.to_date ||
    data.from_date <= data.to_date,
  {
    message: "from_date cannot be greater than to_date.",
  },
);

export const sevaBookingReportQuerySchema = z
  .object({
    from_date: z.iso.date(),
    to_date: z.iso.date(),
    format: z.enum(["excel", "pdf"]),
    temple_id: z.coerce.number().int().positive().optional(),
  })
  .refine((data) => data.from_date <= data.to_date, {
    message: "From date cannot be after to date",
    path: ["from_date"],
  });