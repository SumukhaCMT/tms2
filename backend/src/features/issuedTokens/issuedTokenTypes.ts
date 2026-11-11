import type { RowDataPacket } from "mysql2/promise";

export type IssuedTokenStatus = "pending" | "completed" | "cancelled" | "refunded";
export type IssuedTokenPaymentMethod = "Cash" | "UPI" | "Card" | "Bank Transfer" | "Other";

export interface CreateIssuedTokenInput {
  token_id: number;
  temple_id?: number;
  token_quantity: number;
  token_payment_method: IssuedTokenPaymentMethod;
  token_performed_date: string;
  token_remark?: string | null;
  // devotee_name?: string | null;
  // devotee_mobile?: string | null;
}

export interface CreateIssuedTokenPayload {
  token_id: number;
  temple_id: number;
  token_quantity: number;
  token_payment_method: IssuedTokenPaymentMethod;
  token_performed_date: string;
  token_remark: string | null;
  // devotee_name: string | null;
  // devotee_mobile: string | null;
}

export interface IssuedToken extends RowDataPacket {
  id: number;
  organization_id: number;
  temple_id: number;
  token_id: number | null;
  token_name: string | null;
  token_seva_id: number | null;
  token_seva_name: string;
  token_deity_id: number | null;
  token_deity_name: string | null;
  token_quantity: number;
  token_seva_amount: number;
  token_gst_percent: string | number;
  token_gst_amount: number;
  token_total_amount: number;
  token_payment_method: string | null;
  token_paid_at: string | null;
  token_receipt_number: string | null;
  token_receipt_generated_at: string | null;
  token_status: IssuedTokenStatus;
  token_performed_date: string | null;
  token_remark: string | null;
  issued_by_user_id: number | null;
  created_at: string | null;
  updated_at: string | null;
  // devotee_name?: string | null;
  // devotee_mobile?: string | null;
}

export interface IssuedTokenListQuery {
  page: number;
  limit: number;
  search?: string;
  temple_id?: number;
  token_status?: IssuedTokenStatus;
  from_date?: string;
  to_date?: string;
}

export interface IssuedTokenListResult {
  data: IssuedToken[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface TokenForIssuing extends RowDataPacket {
  id: number;
  organization_id: number;
  temple_id: number;
  token_name: string;
  token_status: "active" | "inactive";
  seva_id: number | null;
  deity_id: number | null;
  seva_name: string | null;
  seva_amount: number | string | null;
  seva_gst_percent: number | string | null;
  deity_name: string | null;
}
