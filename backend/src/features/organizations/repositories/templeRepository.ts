import type {
  PoolConnection,
  RowDataPacket,
} from "mysql2/promise"

export interface TempleRow
  extends RowDataPacket {
  id: number
  organization_id: number
  temp_name: string
  temp_lat: number | null
  temp_lng: number | null
  temp_img_name: string | null
  temp_legal_name: string | null
  temp_registration_number: string | null
  temp_gst_number: string | null
  temp_email: string | null
  temp_phone: string | null
  temp_address_line1: string | null
  temp_address_line2: string | null
  temp_city: string | null
  temp_state: string | null
  temp_country: string | null
  temp_pincode: string | null
  temp_slug: string | null
  temp_is_primary: number
  temp_status: string
  temp_timezone: string
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

export const templeRepository = {
  async findByOrganizationId(
    conn: PoolConnection,
    organizationId: number,
  ) {
    const [rows] =
      await conn.execute<TempleRow[]>(
        `
        SELECT
          id,
          organization_id,
          temp_name,
          temp_lat,
          temp_lng,
          temp_img_name,
          temp_legal_name,
          temp_registration_number,
          temp_gst_number,
          temp_email,
          temp_phone,
          temp_address_line1,
          temp_address_line2,
          temp_city,
          temp_state,
          temp_country,
          temp_pincode,
          temp_slug,
          temp_is_primary,
          temp_status,
          temp_timezone,
          created_at,
          updated_at,
          deleted_at
        FROM temples
        WHERE organization_id = ?
          AND deleted_at IS NULL
        ORDER BY temp_is_primary DESC, id ASC
        `,
        [organizationId],
      )

    return rows
  },
}