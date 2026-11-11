import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise"

import db from "../../config/database"

type Executor = Pool | PoolConnection
type ReferenceType = "plan" | "bundle"

const round = (value: number) => Math.round(value * 100) / 100

const REFERENCE_SQL: Record<ReferenceType, string> = {
  plan: "SELECT plan_amc_price AS price, plan_amc_gst_percentage AS gst, plan_amc_duration_months AS months FROM subscription_plans WHERE id = ?",
  bundle: "SELECT bundle_amc_price AS price, bundle_amc_gst_percentage AS gst, bundle_amc_duration_months AS months FROM subscription_bundles WHERE id = ?",
}

const INSERT_FROM_CYCLE = `
  INSERT IGNORE INTO amc_annual_charges (
    organization_id, org_subscription_id, reference_type, reference_id, amc_year_number,
    duration_months, start_date, end_date, notification_date, amc_amount, amc_gst_percentage, payment_status
  )
  SELECT
    a.organization_id, a.org_subscription_id, a.reference_type, a.reference_id, a.amc_year_number + 1,
    ?, a.end_date, DATE_ADD(a.end_date, INTERVAL ? MONTH), DATE_SUB(a.end_date, INTERVAL 1 MONTH), ?, ?, 'pending'
  FROM amc_annual_charges a
  WHERE a.id = ?
`

export const amcRepository = {
  async resolveTerms(ex: Executor, type: ReferenceType, id: number) {
    const [[reference]] = await ex.query<RowDataPacket[]>(REFERENCE_SQL[type], [id])
    const [defaults] = await ex.query<RowDataPacket[]>(
      "SELECT key_name, value_int FROM system_defaults WHERE key_name IN ('amc_price', 'amc_gst_percentage', 'amc_duration_months')",
    )
    const fallback = Object.fromEntries(defaults.map((row) => [row.key_name, Number(row.value_int)]))
    const hasOwnPrice = reference?.price !== null && reference?.price !== undefined

    return {
      amc_amount: hasOwnPrice ? Number(reference.price) : fallback.amc_price ?? 0,
      amc_gst_percentage: hasOwnPrice ? Number(reference.gst ?? 0) : fallback.amc_gst_percentage ?? 0,
      duration_months: Math.round(Number(reference?.months) || fallback.amc_duration_months || 12),
    }
  },

  async createFirstCycle(ex: Executor, subscriptionId: number, orderItemId: number | null = null) {
    const [[subscription]] = await ex.query<RowDataPacket[]>(
      "SELECT plan_id FROM org_subscriptions WHERE id = ? AND license_type = 'perpetual' AND bundle_id IS NULL AND plan_id IS NOT NULL",
      [subscriptionId],
    )
    if (!subscription) return

    const type: ReferenceType = "plan"
    const referenceId = Number(subscription.plan_id)
    const terms = await this.resolveTerms(ex, type, referenceId)

    await ex.execute(
      `
        INSERT IGNORE INTO amc_annual_charges (
          organization_id, org_subscription_id, reference_type, reference_id, amc_year_number,
          duration_months, start_date, end_date, notification_date, amc_amount, amc_gst_percentage, payment_status,
          order_id, order_item_id, paid_at
        )
        SELECT
          s.organization_id, s.id, ?, ?, 1, ?, s.start_date, DATE_ADD(s.start_date, INTERVAL ? MONTH), NULL, ?, ?, ?,
          oi.order_id, oi.id, IF(oi.id IS NULL, NULL, NOW())
        FROM org_subscriptions s
        LEFT JOIN order_items oi ON oi.id = ?
        WHERE s.id = ?
      `,
      [
        type,
        referenceId,
        terms.duration_months,
        terms.duration_months,
        orderItemId ? terms.amc_amount : 0,
        terms.amc_gst_percentage,
        orderItemId ? "paid" : "free",
        orderItemId,
        subscriptionId,
      ],
    )
  },

  async createDueRenewals() {
    const [cycles] = await db.query<RowDataPacket[]>(`
      SELECT a.id, a.reference_type, a.reference_id
      FROM amc_annual_charges a
      JOIN org_subscriptions s ON s.id = a.org_subscription_id AND s.subscription_status = 'active'
      WHERE a.payment_status IN ('free', 'paid')
        AND DATE_SUB(a.end_date, INTERVAL 1 MONTH) <= CURDATE()
        AND NOT EXISTS (
          SELECT 1 FROM amc_annual_charges n
          WHERE n.org_subscription_id = a.org_subscription_id AND n.amc_year_number = a.amc_year_number + 1
        )
    `)

    for (const cycle of cycles) {
      const terms = await this.resolveTerms(db, cycle.reference_type, Number(cycle.reference_id))
      await db.execute(INSERT_FROM_CYCLE, [
        terms.duration_months,
        terms.duration_months,
        terms.amc_amount,
        terms.amc_gst_percentage,
        cycle.id,
      ])
    }
  },

  async listDue(organizationId: number) {
    const [rows] = await db.query<RowDataPacket[]>(
      `
        SELECT
          a.id, a.org_subscription_id, a.reference_type, a.reference_id, a.amc_year_number,
          a.start_date, a.end_date, a.notification_date,
          COALESCE(p.plan_name, b.bundle_name) AS item_name
        FROM amc_annual_charges a
        LEFT JOIN subscription_plans p ON a.reference_type = 'plan' AND p.id = a.reference_id
        LEFT JOIN subscription_bundles b ON a.reference_type = 'bundle' AND b.id = a.reference_id
        WHERE a.organization_id = ? AND a.payment_status = 'pending'
        ORDER BY a.start_date
      `,
      [organizationId],
    )

    return Promise.all(
      rows.map(async (row) => {
        const { amc_amount, amc_gst_percentage } = await this.resolveTerms(db, row.reference_type, Number(row.reference_id))
        const gstAmount = round((amc_amount * amc_gst_percentage) / 100)
        return { ...row, amc_amount, amc_gst_percentage, gst_amount: gstAmount, total: round(amc_amount + gstAmount) }
      }),
    )
  },
}
