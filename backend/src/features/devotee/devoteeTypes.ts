export type DevoteeStatus = "active" | "inactive";

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

  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface DevoteeListQuery {
  page: number;
  limit: number;
  search?: string;
  status?: DevoteeStatus;
  temple_id?: number;
}

export type UpdateDevoteePayload = Partial<
  Pick<
    Devotee,
    | "temple_id"
    | "devotee_name"
    | "devotee_email"
    | "devotee_phone"
    | "devotee_gender"
    | "devotee_dob"
    | "devotee_gotra"
    | "devotee_rashi"
    | "devotee_nakshatra"
    | "devotee_remark"
    | "devotee_address_line1"
    | "devotee_address_line2"
    | "devotee_city"
    | "devotee_state"
    | "devotee_country"
    | "devotee_pincode"
    | "devotee_status"
  >
>;

export interface DevoteeListResult {
  data: Devotee[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}