import type { PoolConnection, RowDataPacket } from "mysql2/promise"

import db from "../../../config/database"
import { orgSubscriptionRepository } from "../../organizations/repositories/orgsubscriptionRepository"
import { amcRepository } from "../../amc/amcRepository"

export interface PendingOrderItem extends RowDataPacket {
  id: number
  plan_id: number | null
  bundle_id: number | null
  item_type: "plan" | "bundle"
  license_type: string
  quantity: number | null
  start_date: string
  end_date: string | null
  module_data: string | null
}

interface BundlePlanSchedule {
  id: number
  plan_quantity?: number | null
  start_date?: string
  end_date?: string | null
}

const bundlePlans = (item: PendingOrderItem): BundlePlanSchedule[] => {
  const data = typeof item.module_data === "string" ? JSON.parse(item.module_data) : item.module_data
  const plans: BundlePlanSchedule[] = data?.plans ?? []
  return plans
    .map((plan) => (plan.start_date ? plan : { ...plan, start_date: item.start_date, end_date: item.end_date }))
    .sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)))
}

export const orderRequestRepository = {
  async listPending() {
    const [rows] = await db.execute<RowDataPacket[]>(
      `
      SELECT
        o.id, o.order_number, o.organization_id, o.organization_name, o.placed_by_name,
        o.grand_total, o.manual_payment_mode, o.manual_payment_reference, o.manual_payment_date, o.created_at,
        GROUP_CONCAT(oi.item_name ORDER BY oi.id SEPARATOR ', ') AS items
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.order_status = 'placed' AND o.payment_status <> 'failed'
      GROUP BY o.id
      HAVING SUM(oi.org_subscription_id IS NULL) > 0
      ORDER BY o.id DESC
      `,
    )
    return rows
  },

  async findOrder(id: number) {
    const [orders] = await db.execute<RowDataPacket[]>(
      `
      SELECT
        id, order_number, organization_id, organization_name, placed_by_name, order_status, payment_status,
        payment_method, manual_payment_mode, manual_payment_reference,
        DATE_FORMAT(manual_payment_date, '%Y-%m-%d') AS manual_payment_date, manual_payment_recorded_by_name,
        subtotal, total_gst_amount, grand_total, currency,
        billing_name, billing_gst_number, billing_email, billing_phone, billing_address_line1, billing_address_line2,
        billing_city, billing_state, billing_country, billing_pincode, note, created_at,
        payment_gateway, gateway_order_id, gateway_payment_id, paid_at
      FROM orders
      WHERE id = ?
      `,
      [id],
    )
    if (!orders[0]) return null
    const [items] = await db.execute<RowDataPacket[]>(
      `
      SELECT
        id, item_type, item_name, item_code, license_type, quantity,
        DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date, DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,
        unit_price, gst_percentage, gst_amount, line_total, JSON_UNQUOTE(JSON_EXTRACT(module_data, '$.amc.start_date')) AS amc_start_date, JSON_UNQUOTE(JSON_EXTRACT(module_data, '$.amc.end_date')) AS amc_end_date
      FROM order_items
      WHERE order_id = ?
      ORDER BY id
      `,
      [id],
    )
    return { ...orders[0], items }
  },

  async lockPlacedOrder(conn: PoolConnection, id: number) {
    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT id, organization_id FROM orders WHERE id = ? AND order_status = 'placed' FOR UPDATE`,
      [id],
    )
    return rows[0] as { id: number; organization_id: number } | undefined
  },

  async listUnlinkedItems(conn: PoolConnection, orderId: number) {
    const [rows] = await conn.execute<PendingOrderItem[]>(
      `
      SELECT
        oi.id, oi.plan_id, oi.bundle_id, oi.item_type, oi.license_type, oi.quantity,
        DATE_FORMAT(oi.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(oi.end_date, '%Y-%m-%d') AS end_date,
        oi.module_data
      FROM order_items oi
      WHERE oi.order_id = ? AND oi.item_type IN ('plan', 'bundle') AND oi.org_subscription_id IS NULL
      ORDER BY oi.id
      FOR UPDATE
      `,
      [orderId],
    )
    return rows
  },

  async createSubscription(conn: PoolConnection, organizationId: number, item: PendingOrderItem) {
    const base = {
      organization_id: organizationId,
      subscription_type: item.item_type,
      bundle_id: item.bundle_id,
      license_type: item.license_type,
      is_free_trial: 0,
      subscription_status: "active",
    }
    const plans = item.item_type === "bundle" ? bundlePlans(item) : []

    if (!plans.length) {
      const id = await orgSubscriptionRepository.create(conn, {
        ...base,
        plan_id: item.plan_id,
        granted_quantity: Number(item.quantity ?? 0),
        remaining_quantity: Number(item.quantity ?? 0),
        start_date: item.start_date,
        expiry_date: item.end_date,
      })
      await amcRepository.createFirstCycle(conn, id, item.id)
      return id
    }

    const ids: number[] = []
    for (const plan of plans) {
      ids.push(
        await orgSubscriptionRepository.create(conn, {
          ...base,
          plan_id: plan.id,
          granted_quantity: Number(plan.plan_quantity ?? 0),
          remaining_quantity: Number(plan.plan_quantity ?? 0),
          start_date: plan.start_date ?? item.start_date,
          expiry_date: plan.end_date ?? null,
        }),
      )
    }
    await amcRepository.createFirstCycle(conn, ids[0], item.id)
    return ids[0]
  },

  async linkItem(conn: PoolConnection, itemId: number, subscriptionId: number) {
    await conn.execute(`UPDATE order_items SET org_subscription_id = ? WHERE id = ?`, [subscriptionId, itemId])
  },

  async confirmOrder(conn: PoolConnection, id: number) {
    await conn.execute(`UPDATE orders SET order_status = 'confirmed', payment_status = 'paid', paid_at = NOW() WHERE id = ?`, [id])
  },

  async rejectOrder(conn: PoolConnection, id: number) {
    await conn.execute(`UPDATE orders SET order_status = 'cancelled', payment_status = 'failed' WHERE id = ?`, [id])
  },
}
