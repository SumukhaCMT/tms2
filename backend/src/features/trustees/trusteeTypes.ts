
export type TrusteeStatus = "active" | "inactive" |"former";

export interface Trustee {
  id: number;
  organization_id: number;
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

  created_at: Date | null;
  updated_at: Date | null;
}

export interface CreateTrusteePayload {
  temple_id?: number | null;
  trustee_name: string;

  trustee_email?: string | null;
  trustee_phone?: string | null;
  trustee_position?: string | null;
  trustee_display_order?: number;

  trustee_address_line1?: string | null;
  trustee_address_line2?: string | null;
  trustee_city?: string | null;
  trustee_state?: string | null;
  trustee_country?: string;
  trustee_pincode?: string | null;

  trustee_status?: TrusteeStatus;
  start_date: string;
  end_date: string;
}

// export type UpdateTrusteePayload = Partial<CreateTrusteePayload>;
export type UpdateTrusteePayload = Omit<
  Partial<CreateTrusteePayload>,
  "start_date" | "end_date"
> & {
  start_date?: string | null;
  end_date?: string | null;
};

export interface TrusteeListQuery {
  page: number;
  limit: number;
  search?: string;
  status?: TrusteeStatus;
  temple_id?: number;
}

export interface TrusteeListResult {
  data: Trustee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
