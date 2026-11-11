export type TempleStatus =
  | "active"
  | "inactive"
  | "suspended"

export interface Temple {
  id: number
  organization_id: number

  temp_name: string
  temp_img_name?: string | null
  temp_legal_name?: string | null
  temp_registration_number?: string | null
  temp_gst_number?: string | null

  temp_email?: string | null
  temp_phone?: string | null

  temp_address_line1?: string | null
  temp_address_line2?: string | null
  temp_city?: string | null
  temp_state?: string | null
  temp_country: string
  temp_pincode?: string | null

  temp_lat?: number | null
  temp_lng?: number | null

  temp_slug?: string | null
  temp_is_primary: boolean
  temp_status: TempleStatus
  temp_timezone: string

  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null
}

export interface CreateTemplePayload {
  temp_name: string
  temp_img_name?: string | null
  temp_legal_name?: string | null
  temp_registration_number?: string | null
  temp_gst_number?: string | null

  temp_email?: string | null
  temp_phone?: string | null

  temp_address_line1?: string | null
  temp_address_line2?: string | null
  temp_city?: string | null
  temp_state?: string | null
  temp_country?: string
  temp_pincode?: string | null

  temp_lat?: number | null
  temp_lng?: number | null

  temp_slug?: string | null
  temp_is_primary?: boolean
  temp_status?: TempleStatus
  temp_timezone?: string
}

export interface UpdateTemplePayload {
  temp_name?: string
  temp_img_name?: string | null
  temp_legal_name?: string | null
  temp_registration_number?: string | null
  temp_gst_number?: string | null

  temp_email?: string | null
  temp_phone?: string | null

  temp_address_line1?: string | null
  temp_address_line2?: string | null
  temp_city?: string | null
  temp_state?: string | null
  temp_country?: string
  temp_pincode?: string | null

  temp_lat?: number | null
  temp_lng?: number | null

  temp_slug?: string | null
  temp_is_primary?: boolean
  temp_status?: TempleStatus
  temp_timezone?: string
}