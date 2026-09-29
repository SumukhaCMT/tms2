

import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise"

export interface CreateOrderInput {
  organization_id: number
  organization_name: string
  placed_by_name: string
  order_number: string

  order_status: string
  payment_status: string
  payment_method: string

  manual_payment_mode?: string | null
  manual_payment_reference?: string | null
  manual_payment_date?: string | null
  manual_payment_recorded_by_name?: string | null

  subtotal: number
  total_gst_amount: number
  grand_total: number

  currency: string

  billing_name: string
  billing_gst_number?: string | null
  billing_email?: string | null
  billing_phone?: string | null
  billing_address_line1?: string | null
  billing_address_line2?: string | null
  billing_city?: string | null
  billing_state?: string | null
  billing_country?: string | null
  billing_pincode?: string | null

  note?: string | null
}

export interface OrderRow
  extends RowDataPacket {
  id: number
  organization_id: number
  organization_name: string
  placed_by_name: string
  order_number: string

  order_status: string
  payment_status: string
  payment_method: string

  manual_payment_mode: string | null
  manual_payment_reference: string | null
  manual_payment_date: string | null
  manual_payment_recorded_by_name: string | null

  subtotal: number
  total_gst_amount: number
  grand_total: number

  currency: string

  billing_name: string
  billing_gst_number: string | null
  billing_email: string | null
  billing_phone: string | null
  billing_address_line1: string | null
  billing_address_line2: string | null
  billing_city: string | null
  billing_state: string | null
  billing_country: string | null
  billing_pincode: string | null

  note: string | null

  placed_at: Date
  created_at: Date
  updated_at: Date
}

export const orderRepository = {
  async findByOrganizationId(
    conn: PoolConnection,
    organizationId: number,
  ) {
    const [rows] =
      await conn.execute<OrderRow[]>(
        `
        SELECT
          id,
          organization_id,
          organization_name,
          placed_by_name,
          order_number,
          order_status,
          payment_status,
          payment_method,
          manual_payment_mode,
          manual_payment_reference,
          manual_payment_date,
          manual_payment_recorded_by_name,
          subtotal,
          total_gst_amount,
          grand_total,
          currency,
          billing_name,
          billing_gst_number,
          billing_email,
          billing_phone,
          billing_address_line1,
          billing_address_line2,
          billing_city,
          billing_state,
          billing_country,
          billing_pincode,
          note,
          placed_at,
          created_at,
          updated_at
        FROM orders
        WHERE organization_id = ?
        ORDER BY id DESC
        `,
        [organizationId],
      )

    return rows
  },

  async create(
    conn: PoolConnection,
    data: CreateOrderInput,
  ) {
    const [result] =
      await conn.execute<ResultSetHeader>(
        `
        INSERT INTO orders (
          organization_id,
          organization_name,
          placed_by_name,
          order_number,
          order_status,
          payment_status,
          payment_method,
          manual_payment_mode,
          manual_payment_reference,
          manual_payment_date,
          manual_payment_recorded_by_name,
          subtotal,
          total_gst_amount,
          grand_total,
          currency,
          billing_name,
          billing_gst_number,
          billing_email,
          billing_phone,
          billing_address_line1,
          billing_address_line2,
          billing_city,
          billing_state,
          billing_country,
          billing_pincode,
          note,
          placed_at,
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
          NOW(),
          NOW()
        )
        `,
        [
          data.organization_id,
          data.organization_name,
          data.placed_by_name,
          data.order_number,

          data.order_status,
          data.payment_status,
          data.payment_method,

          data.manual_payment_mode ?? null,
          data.manual_payment_reference ?? null,
          data.manual_payment_date ?? null,
          data.manual_payment_recorded_by_name ?? null,

          data.subtotal,
          data.total_gst_amount,
          data.grand_total,

          data.currency,

          data.billing_name,
          data.billing_gst_number ?? null,
          data.billing_email ?? null,
          data.billing_phone ?? null,
          data.billing_address_line1 ?? null,
          data.billing_address_line2 ?? null,
          data.billing_city ?? null,
          data.billing_state ?? null,
          data.billing_country ?? null,
          data.billing_pincode ?? null,

          data.note ?? null,
        ],
      )

    return result.insertId
  },
}