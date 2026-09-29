

import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise"

export interface CreateOrderItemInput {
  order_id: number

  item_type:
    | "plan"
    | "bundle"

  plan_id?: number | null

  bundle_id?: number | null

  item_name: string

  item_code: string

  module_data?: string | null

  license_type: string

  quantity: number

  start_date?: string | null

  end_date?: string | null

  unit_price: number

  gst_percentage: number

  gst_amount: number

  line_total: number

  org_subscription_id?: number | null
}

export interface OrderItemRow
  extends RowDataPacket {
  id: number
  order_id: number
  item_type: "plan" | "bundle"
  plan_id: number | null
  bundle_id: number | null
  item_name: string
  item_code: string
  module_data: string | null
  license_type: string
  quantity: number
  start_date: string | null
  end_date: string | null
  unit_price: number
  gst_percentage: number
  gst_amount: number
  line_total: number
  org_subscription_id: number | null
  created_at: Date
  updated_at: Date
}

export const orderItemRepository = {
  async findByOrderId(
    conn: PoolConnection,
    orderId: number,
  ) {
    const [rows] =
      await conn.execute<OrderItemRow[]>(
        `
        SELECT
          id,
          order_id,
          item_type,
          plan_id,
          bundle_id,
          item_name,
          item_code,
          module_data,
          license_type,
          quantity,
          start_date,
          end_date,
          unit_price,
          gst_percentage,
          gst_amount,
          line_total,
          org_subscription_id,
          created_at,
          updated_at
        FROM order_items
        WHERE order_id = ?
        ORDER BY id ASC
        `,
        [orderId],
      )

    return rows
  },

  async create(
    conn: PoolConnection,
    data: CreateOrderItemInput,
  ) {
    const [result] =
      await conn.execute<ResultSetHeader>(
        `
        INSERT INTO order_items (
          order_id,
          item_type,
          plan_id,
          bundle_id,
          item_name,
          item_code,
          module_data,
          license_type,
          quantity,
          start_date,
          end_date,
          unit_price,
          gst_percentage,
          gst_amount,
          line_total,
          org_subscription_id,
          created_at,
          updated_at
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          NOW(),
          NOW()
        )
        `,
        [
          data.order_id,
          data.item_type,
          data.plan_id ?? null,
          data.bundle_id ?? null,
          data.item_name,
          data.item_code,
          data.module_data ?? null,
          data.license_type,
          data.quantity,
          data.start_date ?? null,
          data.end_date ?? null,
          data.unit_price,
          data.gst_percentage,
          data.gst_amount,
          data.line_total,
          data.org_subscription_id ?? null,
        ],
      )

    return result.insertId
  },
}