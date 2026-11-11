
export type SevaStatus = "active" | "inactive";
export type SevaYesNo = "yes" | "no";

export interface Seva {
  id: number;
  organization_id: number;
  temple_id: number;
  seva_name: string;
  seva_code: string;
  seva_amount: number;
  seva_gst_percent: number;
  seva_is_default: SevaYesNo;
  seva_display_order: number;
  seva_remark: string | null;
  seva_status: SevaStatus;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
    deity_id?: number | null;
    deity_name? :string;
    deity_code?: string;
}

export interface CreateSevaPayload {
  temple_id: number;
  seva_name: string;
  seva_amount: number;
  seva_gst_percent?: number;
  seva_is_default?: SevaYesNo;
  seva_display_order?: number;
  seva_remark?: string | null;
  seva_status?: SevaStatus;
   deity_id?: number | null;
    deity_name? :string;
    deity_code?: string;
}

export type UpdateSevaPayload = Partial<CreateSevaPayload>;

export interface SevaListQuery {
  page: number;
  limit: number;
  search?: string;
  temple_id?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SevaListResult {
  data: Seva[];
  pagination: PaginationMeta;
}
