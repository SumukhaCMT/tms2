export type TempleStatus = "active" | "inactive" | "suspended";

export interface Temple {
  id: number;

  temp_name: string;
  temp_img_name?: string | null;
  temp_legal_name?: string | null;
  temp_registration_number?: string | null;
  temp_gst_number?: string | null;
  temp_email?: string | null;
  temp_phone?: string | null;

  temp_address_line1?: string | null;
  temp_address_line2?: string | null;
  temp_city?: string | null;
  temp_state?: string | null;
  temp_country?: string | null;
  temp_pincode?: string | null;

  temp_lat?: number | null;
  temp_lng?: number | null;

  temp_is_primary: boolean;
  temp_status: TempleStatus;
  temp_timezone: string;

  organization_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TempleFormData {
  temp_name: string;
  temp_img_name: string;
  temp_legal_name: string;
  temp_registration_number: string;
  temp_gst_number: string;
  temp_email: string;
  temp_phone: string;

  temp_address_line1: string;
  temp_address_line2: string;
  temp_city: string;
  temp_state: string;
  temp_country: string;
  temp_pincode: string;

  temp_lat: number | null;
  temp_lng: number | null;

  temp_is_primary: boolean;
  temp_status: TempleStatus;
  temp_timezone: string;
}

export interface TempleApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}