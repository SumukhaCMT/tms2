
export type DevoteeStatus = "active" | "inactive";

export type DevoteeGender = "male" | "female" | "other";

export interface Devotee {
  id: number;
  organization_id: number;
  temple_id: number | null;
  devotee_name: string;
  devotee_email: string | null;
  devotee_phone: string | null;
  devotee_gender: string | null;
  devotee_dob: string | null;
  devotee_gotra: string | null;
  devotee_rashi: string | null;
  devotee_nakshatra: string | null;
  devotee_remark: string | null;
  devotee_address_line1: string | null;
  devotee_address_line2: string | null;
  devotee_city: string | null;
  devotee_state: string | null;
  devotee_country: string | null;
  devotee_pincode: string | null;
  devotee_status: DevoteeStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DevoteeFormData {
  temple_id: number;
  devotee_name: string;
  devotee_email: string | null;
  devotee_phone: string | null;
  devotee_gender: string | null;
  devotee_dob: string | null;
  devotee_gotra: string | null;
  devotee_rashi: string | null;
  devotee_nakshatra: string | null;
  devotee_remark: string | null;
  devotee_address_line1: string | null;
  devotee_address_line2: string | null;
  devotee_city: string | null;
  devotee_state: string | null;
  devotee_country: string | null;
  devotee_pincode: string | null;
  devotee_status: DevoteeStatus;
}

export interface DevoteeListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: DevoteeStatus;
  temple_id?: number;
}

export interface DevoteePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DevoteeListResponse {
  success: boolean;
  message: string;
  data: Devotee[];
  pagination: DevoteePagination;
}

export interface DevoteeResponse {
  success: boolean;
  message: string;
  data: Devotee;
}

export interface DevoteeState {
  devotees: Devotee[];
  selectedDevotee: Devotee | null;
  pagination: DevoteePagination;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}
