


export type TrusteeStatus = "active" | "inactive" |"former";

export interface Trustee {
  id: number;
  organization_id: number;
  temple_id: number | null;
  temple_name?: string | null;

  trustee_name: string;
  trustee_email: string | null;
  trustee_phone: string | null;
  trustee_position: string | null;
  trustee_display_order: number;

  trustee_address_line1: string | null;
  trustee_address_line2: string | null;
  trustee_city: string | null;
  trustee_state: string | null;
  trustee_country: string;
  trustee_pincode: string | null;

  trustee_status: TrusteeStatus;
  start_date: string;
  end_date: string;

  created_at?: string;
  updated_at?: string;
}

export interface CreateTrusteePayload {
  temple_id: number | null;
  trustee_name: string;
  trustee_email: string | null;
  trustee_phone: string | null;
  trustee_position: string | null;
  trustee_display_order: number;

  trustee_address_line1: string | null;
  trustee_address_line2: string | null;
  trustee_city: string | null;
  trustee_state: string | null;
  trustee_country: string;
  trustee_pincode: string | null;

  trustee_status: TrusteeStatus;
  start_date: string;
  end_date: string;
}

export type UpdateTrusteePayload = Partial<CreateTrusteePayload>;

export interface TrusteeListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: TrusteeStatus;
  temple_id?: number;
}

export interface TrusteePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TrusteeListResponse {
  success: boolean;
  data: Trustee[];
  pagination: TrusteePagination;
}

export interface TrusteeResponse {
  success: boolean;
  message?: string;
  data: Trustee;
}

export interface TrusteeState {
  items: Trustee[];
  selectedTrustee: Trustee | null;
  pagination: TrusteePagination;
  loading: boolean;
  error: string | null;
}