import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise"

import db from "../../../config/database"
import { searchCondition, sqlDateTime } from "../../../utils/search"
import type { ManualOrderInput } from "../validations/manualOrderValidation"

export interface ManualOrderPlan extends RowDataPacket {
  id: number
  plan_name: string
  plan_code: string
  plan_type: string
  plan_quantity: number | null
  plan_duration_months: string | null
  plan_price: string
  plan_gst_percentage: string
  plan_total_price: string
  snapshot: string
}

interface EnumColumn extends RowDataPacket {
  COLUMN_NAME: string
  COLUMN_TYPE: string
}

export interface ManualOrderEditRow extends RowDataPacket {
  item_id: number | null
  org_subscription_id: number | null
}

export interface CreateManualOrder extends ManualOrderInput {
  organization_name: string
  subtotal: number
  total_gst_amount: number
  grand_total: number
  paid_at: string
  manual_payment_mode: string | null
  manual_payment_date: string | null
  manual_payment_recorded_by_name: string | null
  payment_gateway: string | null
  gateway_order_id: string | null
  gateway_payment_id: string | null
  gateway_signature: string | null
  gateway_full_response: string | null
}

export interface CreateManualOrderItem {
  order_id: number
  item_type: string
  plan: ManualOrderPlan
  license_type: string
  start_date: string
  end_date: string | null
  gst_amount: number
}

export const manualOrderRepository = {
  async listOrders(search: string) {
    const filter = search
      ? searchCondition(search, [
          "o.order_number", "o.organization_name", "o.placed_by_name",
          "o.order_status", "o.payment_status", "o.payment_method", "oi.item_name",
        ])
      : null
    const [rows] = await db.execute<RowDataPacket[]>(
      `
      SELECT
        o.id, o.order_number, o.organization_name, o.placed_by_name,
        o.payment_method, o.payment_status, o.order_status, o.grand_total,
        ${sqlDateTime("o.placed_at")} AS placed_at,
        GROUP_CONCAT(oi.item_name ORDER BY oi.id SEPARATOR ', ') AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      ${filter ? `WHERE ${filter.sql}` : ""}
      GROUP BY o.id
      ORDER BY o.id DESC
      `,
      filter?.params ?? [],
    )
    return rows
  },

  async listPlans() {
    const [rows] = await db.execute<RowDataPacket[]>(
      `
      SELECT id, plan_name, plan_code, plan_type, plan_duration_months, plan_price, plan_total_price, plan_status
      FROM subscription_plans
      ORDER BY plan_name
      `,
    )
    return rows
  },

  async listOrganizations() {
    const [rows] = await db.execute<RowDataPacket[]>(
      `
      SELECT
        id, org_name, COALESCE(NULLIF(org_legal_name, ''), org_name) AS billing_name, org_gst_number,
        org_email, org_phone, org_address_line1, org_address_line2, org_city, org_state, org_country
      FROM organizations
      WHERE deleted_at IS NULL
      ORDER BY org_name
      `,
    )
    return rows
  },

  async listEnums() {
    const [rows] = await db.execute<EnumColumn[]>(
      `
      SELECT COLUMN_NAME, COLUMN_TYPE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND (
          (TABLE_NAME = 'order_items' AND COLUMN_NAME IN ('item_type', 'license_type'))
          OR (TABLE_NAME = 'orders' AND COLUMN_NAME IN ('order_status', 'payment_status', 'payment_method', 'manual_payment_mode'))
        )
      `,
    )
    return Object.fromEntries(
      rows.map((row) => [row.COLUMN_NAME, [...row.COLUMN_TYPE.matchAll(/'([^']*)'/g)].map((match) => match[1])]),
    ) as Record<string, string[]>
  },

  async findPlan(conn: PoolConnection, id: number) {
    const [rows] = await conn.execute<ManualOrderPlan[]>(
      `
      SELECT
        id, plan_name, plan_code, plan_type, plan_quantity, plan_duration_months,
        plan_price, plan_gst_percentage, plan_total_price,
        JSON_OBJECT(
          'module_id', module_id, 'plan_name', plan_name, 'plan_code', plan_code,
          'plan_description', plan_description, 'plan_type', plan_type,
          'plan_quantity', plan_quantity, 'plan_duration_months', plan_duration_months,
          'plan_amc_price', plan_amc_price, 'plan_amc_duration_months', plan_amc_duration_months,
          'plan_amc_gst_percentage', plan_amc_gst_percentage
        ) AS snapshot
      FROM subscription_plans
      WHERE id = ?
      `,
      [id],
    )
    return rows[0]
  },

  async findOrganizationName(conn: PoolConnection, id: number) {
    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT org_name FROM organizations WHERE id = ? AND deleted_at IS NULL`,
      [id],
    )
    return rows[0]?.org_name as string | undefined
  },

  async createOrder(conn: PoolConnection, data: CreateManualOrder) {
    const [result] = await conn.execute<ResultSetHeader>(
      `
      INSERT INTO orders (
        organization_id, organization_name, placed_by_name, order_number,
        order_status, payment_status, payment_method,
        manual_payment_mode, manual_payment_date, manual_payment_recorded_by_name,
        payment_gateway, gateway_order_id, gateway_payment_id, gateway_signature, gateway_full_response,
        subtotal, total_gst_amount, grand_total, currency,
        billing_name, billing_gst_number, billing_email, billing_phone,
        billing_address_line1, billing_address_line2, billing_city, billing_state, billing_country,
        note, paid_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.organization_id, data.organization_name, data.placed_by_name, data.order_number,
        data.order_status, data.payment_status, data.payment_method,
        data.manual_payment_mode, data.manual_payment_date, data.manual_payment_recorded_by_name,
        data.payment_gateway, data.gateway_order_id, data.gateway_payment_id, data.gateway_signature, data.gateway_full_response,
        data.subtotal, data.total_gst_amount, data.grand_total,
        data.billing_name, data.billing_gst_number, data.billing_email, data.billing_phone,
        data.billing_address_line1, data.billing_address_line2, data.billing_city, data.billing_state, data.billing_country,
        data.note, data.paid_at,
      ],
    )
    return result.insertId
  },

  async createOrderItem(conn: PoolConnection, { order_id, item_type, plan, license_type, start_date, end_date, gst_amount }: CreateManualOrderItem) {
    const [result] = await conn.execute<ResultSetHeader>(
      `
      INSERT INTO order_items (
        order_id, item_type, plan_id, item_name, item_code, module_data, license_type,
        quantity, start_date, end_date, unit_price, gst_percentage, gst_amount, line_total
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        order_id, item_type, plan.id, plan.plan_name, plan.plan_code, plan.snapshot, license_type,
        plan.plan_quantity, start_date, end_date,
        plan.plan_price, plan.plan_gst_percentage, gst_amount, plan.plan_total_price,
      ],
    )
    return result.insertId
  },

  async findOrderForEdit(conn: PoolConnection, id: number) {
    const [rows] = await conn.execute<ManualOrderEditRow[]>(
      `
      SELECT
        o.id, o.organization_id, o.placed_by_name, o.order_number, o.payment_method, o.order_status, o.payment_status,
        o.manual_payment_mode, DATE_FORMAT(o.manual_payment_date, '%Y-%m-%d') AS manual_payment_date,
        o.manual_payment_recorded_by_name, o.payment_gateway, o.gateway_order_id, o.gateway_payment_id,
        o.gateway_signature, o.gateway_full_response,
        o.billing_name, o.billing_gst_number, o.billing_email, o.billing_phone,
        o.billing_address_line1, o.billing_address_line2, o.billing_city, o.billing_state, o.billing_country,
        o.note, o.paid_at,
        oi.id AS item_id, oi.plan_id, oi.license_type, oi.item_type,
        DATE_FORMAT(oi.start_date, '%Y-%m-%d') AS start_date, oi.org_subscription_id
      FROM orders o
      LEFT JOIN order_items oi ON oi.id = (SELECT MIN(id) FROM order_items WHERE order_id = o.id)
      WHERE o.id = ?
      FOR UPDATE
      `,
      [id],
    )
    return rows[0]
  },

  async updateOrder(conn: PoolConnection, id: number, data: CreateManualOrder) {
    await conn.execute(
      `
      UPDATE orders SET
        organization_id = ?, organization_name = ?, placed_by_name = ?,
        order_status = ?, payment_status = ?, payment_method = ?,
        manual_payment_mode = ?, manual_payment_date = ?, manual_payment_recorded_by_name = ?,
        payment_gateway = ?, gateway_order_id = ?, gateway_payment_id = ?, gateway_signature = ?, gateway_full_response = ?,
        subtotal = ?, total_gst_amount = ?, grand_total = ?,
        billing_name = ?, billing_gst_number = ?, billing_email = ?, billing_phone = ?,
        billing_address_line1 = ?, billing_address_line2 = ?, billing_city = ?, billing_state = ?, billing_country = ?,
        note = ?, paid_at = ?
      WHERE id = ?
      `,
      [
        data.organization_id, data.organization_name, data.placed_by_name,
        data.order_status, data.payment_status, data.payment_method,
        data.manual_payment_mode, data.manual_payment_date, data.manual_payment_recorded_by_name,
        data.payment_gateway, data.gateway_order_id, data.gateway_payment_id, data.gateway_signature, data.gateway_full_response,
        data.subtotal, data.total_gst_amount, data.grand_total,
        data.billing_name, data.billing_gst_number, data.billing_email, data.billing_phone,
        data.billing_address_line1, data.billing_address_line2, data.billing_city, data.billing_state, data.billing_country,
        data.note, data.paid_at, id,
      ],
    )
  },

  async updateOrderItem(conn: PoolConnection, id: number, { item_type, plan, license_type, start_date, end_date, gst_amount }: Omit<CreateManualOrderItem, "order_id">) {
    await conn.execute(
      `
      UPDATE order_items SET
        item_type = ?, plan_id = ?, bundle_id = NULL, item_name = ?, item_code = ?, module_data = ?, license_type = ?,
        quantity = ?, start_date = ?, end_date = ?, unit_price = ?, gst_percentage = ?, gst_amount = ?, line_total = ?
      WHERE id = ?
      `,
      [
        item_type, plan.id, plan.plan_name, plan.plan_code, plan.snapshot, license_type,
        plan.plan_quantity, start_date, end_date,
        plan.plan_price, plan.plan_gst_percentage, gst_amount, plan.plan_total_price, id,
      ],
    )
  },

  async updateSubscription(
    conn: PoolConnection,
    id: number,
    data: { organization_id: number; subscription_type: string; plan_id: number; quantity: number; license_type: string; start_date: string; expiry_date: string | null; status: string },
  ) {
    await conn.execute(
      `
      UPDATE org_subscriptions SET
        organization_id = ?, subscription_type = ?, plan_id = ?, bundle_id = NULL,
        granted_quantity = ?, remaining_quantity = LEAST(remaining_quantity, ?),
        license_type = ?, start_date = ?, expiry_date = ?, subscription_status = ?
      WHERE id = ?
      `,
      [
        data.organization_id, data.subscription_type, data.plan_id,
        data.quantity, data.quantity,
        data.license_type, data.start_date, data.expiry_date, data.status, id,
      ],
    )
  },
}
