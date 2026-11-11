import type { RowDataPacket } from "mysql2"

import pool from "../../config/database"

const MONTHS = 6

const SUMMARY_METRICS: Record<string, string> = {
  donation_amount: "SELECT COALESCE(SUM(m.donation_monetary_amount), 0) FROM donation_monetary m JOIN donations d ON d.id = m.donation_id WHERE d.organization_id = ?",
  bookings: "SELECT COUNT(*) FROM seva_bookings WHERE organization_id = ? AND deleted_at IS NULL",
  booking_amount: "SELECT COALESCE(SUM(booking_total_amount), 0) FROM seva_bookings WHERE organization_id = ? AND deleted_at IS NULL AND booking_status <> 'cancelled'",
  upcoming_bookings: "SELECT COUNT(*) FROM seva_bookings WHERE organization_id = ? AND deleted_at IS NULL AND booking_status IN ('booked', 'confirmed') AND booking_scheduled_date >= CURDATE()",
  today_bookings: "SELECT COUNT(*) FROM seva_bookings WHERE organization_id = ? AND deleted_at IS NULL AND booking_status <> 'cancelled' AND booking_scheduled_date = CURDATE()",
  unpaid_bookings: "SELECT COUNT(*) FROM seva_bookings WHERE organization_id = ? AND deleted_at IS NULL AND booking_status <> 'cancelled' AND booking_payment_status = 'pending'",
  token_amount: "SELECT COALESCE(SUM(token_total_amount), 0) FROM issued_tokens WHERE organization_id = ? AND token_status NOT IN ('cancelled', 'refunded')",
  hundis: "SELECT COUNT(*) FROM define_hundi WHERE organization_id = ? AND deleted_at IS NULL",
  hundi_openings: "SELECT COUNT(*) FROM hundi WHERE organization_id = ? AND deleted_at IS NULL",
  hundi_counted: "SELECT COALESCE(SUM(u.total_amount), 0) FROM hundi_user_denominations u JOIN hundi h ON h.id = u.hundi_id WHERE h.organization_id = ? AND h.deleted_at IS NULL",
  hundi_amount: "SELECT COALESCE(SUM(deposit_amount), 0) FROM hundi_bank_deposits WHERE organization_id = ?",
  inventory_items: "SELECT COUNT(*) FROM inventory WHERE inventory_organization_id = ? AND inventory_deleted_at IS NULL",
  inventory_stock: "SELECT COALESCE(SUM(inventory_stock_quantity), 0) FROM inventory WHERE inventory_organization_id = ? AND inventory_deleted_at IS NULL",
  out_of_stock: "SELECT COUNT(*) FROM inventory WHERE inventory_organization_id = ? AND inventory_deleted_at IS NULL AND inventory_stock_quantity <= 0",
  subscriptions: "SELECT COUNT(*) FROM org_subscriptions WHERE organization_id = ? AND subscription_status = 'active'",
  next_expiry: "SELECT DATE_FORMAT(MIN(expiry_date), '%Y-%m-%d') FROM org_subscriptions WHERE organization_id = ? AND subscription_status = 'active' AND expiry_date >= CURDATE()",
}

const SUMMARY_KEYS = Object.keys(SUMMARY_METRICS)

export const getOrgSummary = async (orgId: number) => {
  const [[row]] = await pool.query<RowDataPacket[]>(
    `SELECT ${SUMMARY_KEYS.map((key) => `(${SUMMARY_METRICS[key]}) AS ${key}`).join(", ")}`,
    Array(SUMMARY_KEYS.length).fill(orgId),
  )
  return row
}

export const getOrgBreakdowns = async (orgId: number) => {
  const [[bookingStatus], [paymentMethods], [topSevas]] = await Promise.all([
    pool.query<RowDataPacket[]>(
      "SELECT booking_status AS name, COUNT(*) AS value FROM seva_bookings WHERE organization_id = ? AND deleted_at IS NULL GROUP BY booking_status",
      [orgId],
    ),
    pool.query<RowDataPacket[]>(
      `
        SELECT LOWER(REPLACE(method, ' ', '_')) AS name, SUM(amount) AS value
        FROM (
          SELECT m.donation_method AS method, m.donation_monetary_amount AS amount
          FROM donation_monetary m JOIN donations d ON d.id = m.donation_id WHERE d.organization_id = ?
          UNION ALL
          SELECT booking_payment_method, booking_total_amount FROM seva_bookings
          WHERE organization_id = ? AND deleted_at IS NULL AND booking_payment_status = 'paid' AND booking_payment_method IS NOT NULL
          UNION ALL
          SELECT token_payment_method, token_total_amount FROM issued_tokens
          WHERE organization_id = ? AND token_status NOT IN ('cancelled', 'refunded')
        ) payments
        GROUP BY name
        ORDER BY value DESC
      `,
      [orgId, orgId, orgId],
    ),
    pool.query<RowDataPacket[]>(
      `
        SELECT name, SUM(total) AS count, SUM(amount) AS value
        FROM (
          SELECT seva_name AS name, 1 AS total, booking_total_amount AS amount FROM seva_bookings
          WHERE organization_id = ? AND deleted_at IS NULL AND booking_status <> 'cancelled'
          UNION ALL
          SELECT token_seva_name, token_quantity, token_total_amount FROM issued_tokens
          WHERE organization_id = ? AND token_status NOT IN ('cancelled', 'refunded') AND token_seva_name IS NOT NULL
        ) sevas
        GROUP BY name
        ORDER BY value DESC
        LIMIT 5
      `,
      [orgId, orgId],
    ),
  ])

  const numeric = (rows: RowDataPacket[]) => rows.map((row) => ({ ...row, value: Number(row.value), ...(row.count !== undefined && { count: Number(row.count) }) }))
  return { bookingStatus: numeric(bookingStatus), paymentMethods: numeric(paymentMethods), topSevas: numeric(topSevas) }
}

export const getOrgMonthlyRevenue = async (orgId: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
      SELECT month, SUM(donations) AS donations, SUM(bookings) AS bookings, SUM(tokens) AS tokens, SUM(hundi) AS hundi
      FROM (
        SELECT DATE_FORMAT(d.created_at, '%Y-%m') AS month, m.donation_monetary_amount AS donations, 0 AS bookings, 0 AS tokens, 0 AS hundi
        FROM donation_monetary m JOIN donations d ON d.id = m.donation_id
        WHERE d.organization_id = ? AND d.created_at >= ?
        UNION ALL
        SELECT DATE_FORMAT(created_at, '%Y-%m'), 0, booking_total_amount, 0, 0
        FROM seva_bookings
        WHERE organization_id = ? AND deleted_at IS NULL AND booking_status <> 'cancelled' AND created_at >= ?
        UNION ALL
        SELECT DATE_FORMAT(created_at, '%Y-%m'), 0, 0, token_total_amount, 0
        FROM issued_tokens
        WHERE organization_id = ? AND token_status NOT IN ('cancelled', 'refunded') AND created_at >= ?
        UNION ALL
        SELECT DATE_FORMAT(deposit_date, '%Y-%m'), 0, 0, 0, deposit_amount
        FROM hundi_bank_deposits
        WHERE organization_id = ? AND deposit_date >= ?
      ) revenue
      GROUP BY month
    `,
    [orgId, monthStart(), orgId, monthStart(), orgId, monthStart(), orgId, monthStart()],
  )

  const byMonth = new Map(rows.map((row) => [row.month, row]))
  return Array.from({ length: MONTHS }, (_, i) => {
    const date = new Date()
    date.setUTCDate(1)
    date.setUTCMonth(date.getUTCMonth() - (MONTHS - 1 - i))
    const month = date.toISOString().slice(0, 7)
    const row = byMonth.get(month)
    return {
      month,
      donations: Number(row?.donations ?? 0),
      bookings: Number(row?.bookings ?? 0),
      tokens: Number(row?.tokens ?? 0),
      hundi: Number(row?.hundi ?? 0),
    }
  })
}

export const getOrgTempleBreakdown = async (orgId: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
      SELECT
        t.id, t.temp_name, t.temp_status,
        COALESCE(d.amount, 0) AS donation_amount,
        COALESCE(b.total, 0) AS bookings,
        COALESCE(b.amount, 0) AS booking_amount,
        COALESCE(k.total, 0) AS tokens,
        COALESCE(k.amount, 0) AS token_amount,
        COALESCE(h.amount, 0) AS hundi_amount
      FROM temples t
      LEFT JOIN (
        SELECT d.temple_id, SUM(m.donation_monetary_amount) AS amount
        FROM donations d JOIN donation_monetary m ON m.donation_id = d.id
        WHERE d.organization_id = ? GROUP BY d.temple_id
      ) d ON d.temple_id = t.id
      LEFT JOIN (
        SELECT temple_id, COUNT(*) AS total, SUM(IF(booking_status <> 'cancelled', booking_total_amount, 0)) AS amount
        FROM seva_bookings WHERE organization_id = ? AND deleted_at IS NULL GROUP BY temple_id
      ) b ON b.temple_id = t.id
      LEFT JOIN (
        SELECT temple_id, SUM(token_quantity) AS total, SUM(token_total_amount) AS amount
        FROM issued_tokens WHERE organization_id = ? AND token_status NOT IN ('cancelled', 'refunded') GROUP BY temple_id
      ) k ON k.temple_id = t.id
      LEFT JOIN (
        SELECT temple_id, SUM(deposit_amount) AS amount
        FROM hundi_bank_deposits WHERE organization_id = ? GROUP BY temple_id
      ) h ON h.temple_id = t.id
      WHERE t.organization_id = ? AND t.deleted_at IS NULL
      ORDER BY t.temp_is_primary DESC, t.temp_name
    `,
    Array(5).fill(orgId),
  )
  return rows
}

function monthStart() {
  const date = new Date()
  date.setUTCDate(1)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCMonth(date.getUTCMonth() - (MONTHS - 1))
  return date
}
