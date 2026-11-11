

import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

import type {
  CreateSevaBookingInput,
  SevaBooking,
  SevaBookingListResult,
  ListSevaBookingsQuery,
  UpdateSevaBookingInput,
  SevaBookingScope,
} from "../sevaBookingTypes";

interface SevaBookingRow extends SevaBooking, RowDataPacket {}

interface CountRow extends RowDataPacket {
  total: number;
}

interface SevaPriceRow extends RowDataPacket {
  id: number;
  temple_id: number;
  seva_name: string;
  seva_code: string;
  seva_amount: number;
  seva_gst_percent: number;
}

interface DevoteeRow extends RowDataPacket {
  id: number;
  devotee_name: string;
  devotee_phone: string | null;
  devotee_email: string | null;
  devotee_gotra: string | null;
  devotee_rashi: string | null;
  devotee_nakshatra: string | null;
}

interface DevoteeSnapshot {
  id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  gotra: string | null;
  rashi: string | null;
  nakshatra: string | null;
}

type SqlValue = string | number | null | Date;

const SELECT_FIELDS = `
  id,
  organization_id,
  temple_id,
  booking_type,
  devotee_id,
  devotee_name,
  devotee_phone,
  devotee_email,
  devotee_gotra,
  devotee_rashi,
  devotee_nakshatra,
  deity_name,
  deity_code,
  seva_name,
  seva_code,
  seva_amount,
  seva_gst_percent,
  booking_gst_amount,
  booking_total_amount,
  booking_scheduled_date,
  booking_scheduled_time,
  booking_payment_status,
  booking_payment_method,
  booking_paid_at,
  booking_receipt_number,
  booking_receipt_generated_at,
  booking_status,
  booking_remark,
  booking_internal_note,
  created_by_user_id,
  created_at,
  updated_at,
  deleted_at
`;

/**
 * NORMALIZE PHONE NUMBER
 *
 * Removes spaces, hyphens, brackets and plus signs.
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()+]/g, "").trim();
}

/**
 * CONVERT DATABASE DEVOTEE TO BOOKING SNAPSHOT
 */
function toDevoteeSnapshot(row: DevoteeRow): DevoteeSnapshot {
  return {
    id: Number(row.id),
    name: row.devotee_name,
    phone: row.devotee_phone,
    email: row.devotee_email,
    gotra: row.devotee_gotra,
    rashi: row.devotee_rashi,
    nakshatra: row.devotee_nakshatra,
  };
}

/**
 * CHECK TEMPLE
 */
async function assertTempleBelongsToOrganization(
  connection: PoolConnection,
  organizationId: number,
  templeId: number,
): Promise<void> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    `
      SELECT id
      FROM temples
      WHERE id = ?
        AND organization_id = ?
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [templeId, organizationId],
  );

  if (rows.length === 0) {
    throw new Error("Temple not found");
  }
}

/**
 * GET ACTIVE SEVA AND PRICE
 */
async function findActiveSeva(
  connection: PoolConnection,
  organizationId: number,
  templeId: number,
  sevaCode: string,
): Promise<SevaPriceRow | null> {
  const [rows] = await connection.execute<SevaPriceRow[]>(
    `
      SELECT
        id,
        temple_id,
        seva_name,
        seva_code,
        seva_amount,
        seva_gst_percent
      FROM sevas
      WHERE organization_id = ?
        AND temple_id = ?
        AND seva_code = ?
        AND seva_status = 'active'
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [organizationId, templeId, sevaCode],
  );

  return rows[0] ?? null;
}

/**
 * FIND OR CREATE DEVOTEE
 *
 * Priority:
 * 1. If devotee_id is provided, validate and reuse it.
 * 2. Otherwise, find an existing devotee using phone number.
 * 3. If no existing devotee is found, create a new devotee.
 *
 * Phone matching is organization-wide, not temple-specific.
 */
async function findOrCreateDevotee(
  connection: PoolConnection,
  organizationId: number,
  templeId: number,
  data: CreateSevaBookingInput,
): Promise<DevoteeSnapshot | null> {
  const suppliedDevoteeId = data.devotee_id ?? null;

  const suppliedName = data.devotee_name?.trim() || null;

  const suppliedPhone = data.devotee_phone?.trim()
    ? normalizePhone(data.devotee_phone)
    : null;

  const suppliedEmail = data.devotee_email?.trim() || null;
  const suppliedGotra = data.devotee_gotra?.trim() || null;
  const suppliedRashi = data.devotee_rashi?.trim() || null;
  const suppliedNakshatra = data.devotee_nakshatra?.trim() || null;

  /**
   * CASE 1: DEVOTEE ID PROVIDED
   *
   * Validate that the devotee belongs to the same organization.
   */
  if (suppliedDevoteeId !== null) {
    const [rows] = await connection.execute<DevoteeRow[]>(
      `
        SELECT
          id,
          devotee_name,
          devotee_phone,
          devotee_email,
          devotee_gotra,
          devotee_rashi,
          devotee_nakshatra
        FROM devotees
        WHERE id = ?
          AND organization_id = ?
          AND devotee_status = 'active'
          AND deleted_at IS NULL
        LIMIT 1
        FOR UPDATE
      `,
      [suppliedDevoteeId, organizationId],
    );

    if (rows.length === 0) {
      throw new Error("Devotee not found or inactive");
    }

    return toDevoteeSnapshot(rows[0]);
  }

  /**
   * CASE 2: SEARCH EXISTING DEVOTEE BY PHONE
   *
   * Do not filter by temple_id.
   * A devotee can book seva at multiple temples
   * under the same organization.
   */
  if (suppliedPhone) {
    const [rows] = await connection.execute<DevoteeRow[]>(
      `
        SELECT
          id,
          devotee_name,
          devotee_phone,
          devotee_email,
          devotee_gotra,
          devotee_rashi,
          devotee_nakshatra
        FROM devotees
        WHERE organization_id = ?
          AND REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(
                        COALESCE(devotee_phone, ''),
                        ' ',
                        ''
                      ),
                      '-',
                      ''
                    ),
                    '+',
                    ''
                  ),
                  '(',
                  ''
                ),
                ')',
                ''
              ) = ?
          AND devotee_status = 'active'
          AND deleted_at IS NULL
        ORDER BY id ASC
        LIMIT 1
        FOR UPDATE
      `,
      [organizationId, suppliedPhone],
    );

    /**
     * Existing devotee found.
     * Reuse the existing database record.
     */
    if (rows.length > 0) {
      return toDevoteeSnapshot(rows[0]);
    }

    /**
     * No existing devotee found.
     * A name is mandatory to create a new devotee.
     */
    if (!suppliedName) {
      throw new Error("Devotee name is required for a new devotee");
    }
  }

  /**
   * CASE 3: NO PHONE AND NO NAME
   *
   * Allow booking without a devotee.
   */
  if (!suppliedName && !suppliedPhone) {
    return null;
  }

  /**
   * CASE 4: CREATE NEW DEVOTEE
   */
  if (!suppliedName) {
    throw new Error("Devotee name is required for a new devotee");
  }

  const [result] = await connection.execute<ResultSetHeader>(
    `
      INSERT INTO devotees (
        organization_id,
        temple_id,
        devotee_name,
        devotee_email,
        devotee_phone,
        devotee_gotra,
        devotee_rashi,
        devotee_nakshatra,
        devotee_status,
        created_at,
        updated_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        'active',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
    `,
    [
      organizationId,
      templeId,
      suppliedName,
      suppliedEmail,
      suppliedPhone,
      suppliedGotra,
      suppliedRashi,
      suppliedNakshatra,
    ],
  );

  const newDevoteeId = Number(result.insertId);

  if (!Number.isSafeInteger(newDevoteeId) || newDevoteeId <= 0) {
    throw new Error("Failed to create devotee");
  }

  return {
    id: newDevoteeId,
    name: suppliedName,
    phone: suppliedPhone,
    email: suppliedEmail,
    gotra: suppliedGotra,
    rashi: suppliedRashi,
    nakshatra: suppliedNakshatra,
  };
}

/**
 * CREATE SEVA BOOKING
 */
export async function createBooking(
  connection: PoolConnection,
  organizationId: number,
  scope: SevaBookingScope,
  data: CreateSevaBookingInput,
): Promise<number> {
  await assertTempleBelongsToOrganization(
    connection,
    organizationId,
    scope.temple_id,
  );

  if (data.booking_type && data.booking_type !== "one_time") {
    throw new Error("Only one-time bookings are currently supported");
  }

  /**
   * STEP 1: FIND OR CREATE DEVOTEE
   */
  const devotee = await findOrCreateDevotee(
    connection,
    organizationId,
    scope.temple_id,
    data,
  );

  /**
   * STEP 2: GET ACTIVE SEVA
   */
  const seva = await findActiveSeva(
    connection,
    organizationId,
    scope.temple_id,
    data.seva_code,
  );

  if (!seva) {
    throw new Error("Seva not found or inactive");
  }

  /**
   * STEP 3: CALCULATE SEVA AMOUNT AND GST
   */
  const sevaAmount = Number(seva.seva_amount);
  const gstPercent = Number(seva.seva_gst_percent);

  const gstAmount = Math.round(
    (sevaAmount * gstPercent) / 100,
  );

  const totalAmount = sevaAmount + gstAmount;

  /**
   * STEP 4: INSERT BOOKING
   *
   * Devotee details come from the resolved database record.
   */
  const [result] = await connection.execute<ResultSetHeader>(
    `
      INSERT INTO seva_bookings (
        organization_id,
        temple_id,
        booking_type,
        devotee_id,
        devotee_name,
        devotee_phone,
        devotee_email,
        devotee_gotra,
        devotee_rashi,
        devotee_nakshatra,
        deity_name,
        deity_code,
        seva_name,
        seva_code,
        seva_amount,
        seva_gst_percent,
        booking_gst_amount,
        booking_total_amount,
        booking_scheduled_date,
        booking_scheduled_time,
        booking_payment_status,
        booking_status,
        booking_remark,
        booking_internal_note,
        created_by_user_id
      )
      VALUES (
        ?, ?, 'one_time', ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'booked', ?, ?, ?
      )
    `,
    [
      organizationId,
      scope.temple_id,

      // Resolved devotee details
      devotee?.id ?? null,
      devotee?.name ?? null,
      devotee?.phone ?? null,
      devotee?.email ?? null,
      devotee?.gotra ?? null,
      devotee?.rashi ?? null,
      devotee?.nakshatra ?? null,

      // Deity details
      data.deity_name ?? null,
      data.deity_code ?? null,

      // Seva details
      seva.seva_name,
      seva.seva_code,
      sevaAmount,
      gstPercent,
      gstAmount,
      totalAmount,

      // Booking schedule
      data.booking_scheduled_date,
      data.booking_scheduled_time ?? null,

      // Remarks
      data.booking_remark ?? null,
      data.booking_internal_note ?? null,

      scope.created_by_user_id,
    ],
  );

  const id = Number(result.insertId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Failed to generate booking ID");
  }

  /**
   * STEP 5: GENERATE RECEIPT NUMBER
   */
  const receiptNumber =
    `SB-T${scope.temple_id}-${String(id).padStart(6, "0")}`;

  const [receiptResult] = await connection.execute<ResultSetHeader>(
    `
      UPDATE seva_bookings
      SET booking_receipt_number = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND organization_id = ?
        AND temple_id = ?
        AND deleted_at IS NULL
    `,
    [
      receiptNumber,
      id,
      organizationId,
      scope.temple_id,
    ],
  );

  if (receiptResult.affectedRows !== 1) {
    throw new Error("Failed to generate booking receipt");
  }

  return id;
}

/**
 * LIST
 */
export async function listBookings(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  query: ListSevaBookingsQuery,
): Promise<SevaBookingListResult> {
  const conditions: string[] = [
    "organization_id = ?",
    "deleted_at IS NULL",
  ];

  const params: SqlValue[] = [organizationId];

  if (userTempleId !== null) {
    conditions.push("temple_id = ?");
    params.push(userTempleId);
  } else if (query.temple_id !== undefined) {
    conditions.push("temple_id = ?");
    params.push(query.temple_id);
  }

  if (query.search?.trim()) {
    const search = `%${query.search.trim()}%`;

    conditions.push(`
      (
        devotee_name LIKE ?
        OR devotee_phone LIKE ?
        OR devotee_email LIKE ?
        OR seva_name LIKE ?
        OR seva_code LIKE ?
        OR booking_receipt_number LIKE ?
      )
    `);

    params.push(
      search,
      search,
      search,
      search,
      search,
      search,
    );
  }

  if (query.booking_payment_status) {
    conditions.push("booking_payment_status = ?");
    params.push(query.booking_payment_status);
  }

  if (query.booking_status) {
    conditions.push("booking_status = ?");
    params.push(query.booking_status);
  }

  if (query.from_date) {
    conditions.push("booking_scheduled_date >= ?");
    params.push(query.from_date);
  }

  if (query.to_date) {
    conditions.push("booking_scheduled_date <= ?");
    params.push(query.to_date);
  }

  const where = conditions.join(" AND ");

  const [countRows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS total
      FROM seva_bookings
      WHERE ${where}
    `,
    params,
  );

  const total = Number(countRows[0]?.total ?? 0);
  const offset = (query.page - 1) * query.limit;

  const [rows] = await connection.execute<SevaBookingRow[]>(
    `
      SELECT ${SELECT_FIELDS}
      FROM seva_bookings
      WHERE ${where}
      ORDER BY booking_scheduled_date DESC, id DESC
      LIMIT ? OFFSET ?
    `,
    [...params, query.limit, offset],
  );

  return {
    data: rows,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

/**
 * GET BY ID
 */
export async function getBookingById(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
): Promise<SevaBooking | null> {
  const conditions: string[] = [
    "id = ?",
    "organization_id = ?",
    "deleted_at IS NULL",
  ];

  const params: SqlValue[] = [id, organizationId];

  if (userTempleId !== null) {
    conditions.push("temple_id = ?");
    params.push(userTempleId);
  }

  const [rows] = await connection.execute<SevaBookingRow[]>(
    `
      SELECT ${SELECT_FIELDS}
      FROM seva_bookings
      WHERE ${conditions.join(" AND ")}
      LIMIT 1
    `,
    params,
  );

  return rows[0] ?? null;
}

/**
 * UPDATE
 */
export async function updateBooking(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
  data: UpdateSevaBookingInput,
): Promise<boolean> {
  const current = await getBookingById(
    connection,
    organizationId,
    userTempleId,
    id,
  );

  if (!current) {
    return false;
  }

  const allowedFields: Array<keyof UpdateSevaBookingInput> = [
    "devotee_id",
    "devotee_name",
    "devotee_phone",
    "devotee_email",
    "devotee_gotra",
    "devotee_rashi",
    "devotee_nakshatra",
    "booking_scheduled_date",
    "booking_scheduled_time",
    "booking_remark",
    "booking_internal_note",
  ];

  const fields: string[] = [];
  const values: SqlValue[] = [];

  for (const field of allowedFields) {
    const value = data[field];

    if (value !== undefined) {
      fields.push(`${field} = ?`);
      values.push(value as SqlValue);
    }
  }

  if (fields.length === 0) {
    return true;
  }

  const conditions = [
    "id = ?",
    "organization_id = ?",
    "deleted_at IS NULL",
  ];

  const whereValues: SqlValue[] = [id, organizationId];

  if (userTempleId !== null) {
    conditions.push("temple_id = ?");
    whereValues.push(userTempleId);
  }

  const [result] = await connection.execute<ResultSetHeader>(
    `
      UPDATE seva_bookings
      SET ${fields.join(", ")},
          updated_at = CURRENT_TIMESTAMP
      WHERE ${conditions.join(" AND ")}
    `,
    [...values, ...whereValues],
  );

  return result.affectedRows > 0;
}

/**
 * UPDATE PAYMENT
 */
export async function updatePayment(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
  status: "pending" | "paid" | "failed" | "refunded",
  method?: string | null,
): Promise<boolean> {
  const conditions = [
    "id = ?",
    "organization_id = ?",
    "deleted_at IS NULL",
  ];

  const whereValues: SqlValue[] = [id, organizationId];

  if (userTempleId !== null) {
    conditions.push("temple_id = ?");
    whereValues.push(userTempleId);
  }

  const [result] = await connection.execute<ResultSetHeader>(
    `
      UPDATE seva_bookings
      SET booking_payment_status = ?,
          booking_payment_method = ?,
          booking_paid_at =
            CASE
              WHEN ? = 'paid' THEN COALESCE(booking_paid_at, CURRENT_TIMESTAMP)
              ELSE NULL
            END,
          booking_receipt_generated_at =
            CASE
              WHEN ? = 'paid' THEN COALESCE(booking_receipt_generated_at, CURRENT_TIMESTAMP)
              ELSE NULL
            END,
          updated_at = CURRENT_TIMESTAMP
      WHERE ${conditions.join(" AND ")}
    `,
    [
      status,
      method ?? null,
      status,
      status,
      ...whereValues,
    ],
  );

  return result.affectedRows > 0;
}

/**
 * UPDATE BOOKING STATUS
 */
export async function updateStatus(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
  status: "booked" | "confirmed" | "completed" | "cancelled",
): Promise<boolean> {
  const conditions = [
    "id = ?",
    "organization_id = ?",
    "deleted_at IS NULL",
  ];

  const params: SqlValue[] = [status, id, organizationId];

  if (userTempleId !== null) {
    conditions.push("temple_id = ?");
    params.push(userTempleId);
  }

  const [result] = await connection.execute<ResultSetHeader>(
    `
      UPDATE seva_bookings
      SET booking_status = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE ${conditions.join(" AND ")}
    `,
    params,
  );

  return result.affectedRows > 0;
}

/**
 * SOFT DELETE
 */
export async function softDeleteBooking(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  id: number,
): Promise<boolean> {
  const conditions = [
    "id = ?",
    "organization_id = ?",
    "deleted_at IS NULL",
  ];

  const params: SqlValue[] = [id, organizationId];

  if (userTempleId !== null) {
    conditions.push("temple_id = ?");
    params.push(userTempleId);
  }

  const [result] = await connection.execute<ResultSetHeader>(
    `
      UPDATE seva_bookings
      SET deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE ${conditions.join(" AND ")}
    `,
    params,
  );

  return result.affectedRows > 0;
}

export async function getBookingsForReport(
  connection: PoolConnection,
  organizationId: number,
  userTempleId: number | null,
  query: {
    from_date: string;
    to_date: string;
    temple_id?: number;
  },
): Promise<SevaBooking[]> {
  const conditions: string[] = [
    "organization_id = ?",
    "deleted_at IS NULL",
    "booking_scheduled_date >= ?",
    "booking_scheduled_date <= ?",
  ];

  const params: SqlValue[] = [
    organizationId,
    query.from_date,
    query.to_date,
  ];

  // Temple-level user cannot access another temple.
  if (userTempleId !== null) {
    conditions.push("temple_id = ?");
    params.push(userTempleId);
  } else if (query.temple_id !== undefined) {
    conditions.push("temple_id = ?");
    params.push(query.temple_id);
  }

  const [rows] = await connection.execute<SevaBookingRow[]>(
    `
      SELECT ${SELECT_FIELDS}
      FROM seva_bookings
      WHERE ${conditions.join(" AND ")}
      ORDER BY booking_scheduled_date ASC, id ASC
    `,
    params,
  );

  return rows;
}