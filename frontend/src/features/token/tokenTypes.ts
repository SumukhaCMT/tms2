export type TokenStatus = "active" | "inactive";

export interface Token {
  id: number;
  organization_id: number;
  temple_id: number;

  // Names returned by backend JOINs
  temple_name?: string | null;

  token_code: string;
  token_name: string;
  token_description: string | null;
  max_limit: number | null;
  seva_id: number | null;
  seva_name?: string | null;

  deity_id: number | null;
  deity_name?: string | null;

  token_display_order: number;
  token_status: TokenStatus;

  created_at: string | null;
  updated_at: string | null;
}

// export interface CreateTokenPayload {
//   temple_id: number;
//   token_name: string;
//   token_description: string | null;
//   seva_id: number | null;
//   deity_id: number | null;
//   token_display_order: number;
//   token_status: TokenStatus;
//   token_max_count: number;
// }
export interface CreateTokenPayload {
  temple_id: number;
  token_name: string;
  token_description: string | null;
  seva_id: number | null;
  deity_id: number | null;
  token_display_order: number;
  token_status: TokenStatus;
  max_limit: number | null;
}

export type UpdateTokenPayload = Partial<CreateTokenPayload>;

export interface TokenPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FetchTokensParams {
  page: number;
  limit: number;
  search?: string;
}

export interface TokenApiResponse {
  success: boolean;
  message: string;
  data: Token;
}

export interface TokensApiResponse {
  success: boolean;
  message: string;
  data: Token[];
  pagination?: TokenPagination;
}

export interface TokensListResult {
  items: Token[];
  pagination: TokenPagination;
}

export interface TokenState {
  items: Token[];
  selectedToken: Token | null;
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  deletingId: number | null;
  error: string | null;
  pagination: TokenPagination;
}

export interface IssueTokenPayload {
  token_id: number;
  temple_id: number;
  token_quantity: number;
  token_performed_date: string;
  token_payment_method: string;
  token_remark: string | null;
}

// export interface IssuedToken {
//   id?: number;
//   token_id?: number;
//   temple_id?: number;
//   token_quantity?: number;
//   token_performed_date?: string;
//   token_payment_method?: string;
//   token_remark?: string | null;
//   token_receipt_number?: string | null;
//   receipt_number?: string | null;
// }

export interface IssuedToken {
  id: number;
  organization_id?: number;
  temple_id: number;
receipt_number: string | null;
  // Master token reference
  token_id: number;
  token_name?: string | null;
  token_code?: string | null;

  token_seva_id?: number | null;
  token_seva_name?: string | null;

  token_deity_id?: number | null;
  token_deity_name?: string | null;

  token_quantity: number;

  token_seva_amount?: number;
  token_gst_percent?: number;
  token_gst_amount?: number;
  token_total_amount?: number;

  token_payment_method: string;
  token_performed_date: string;

  token_receipt_number?: string | null;
  token_receipt_generated_at?: string | null;

  token_status: string;
  token_remark?: string | null;

  issued_by_user_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IssuedTokensPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FetchIssuedTokensParams {
  page: number;
  limit: number;
  search?: string;
  temple_id?: number;
  token_status?: string;
  from_date?: string;
  to_date?: string;
}

export interface IssuedTokensListResult {
  items: IssuedToken[];
  pagination: IssuedTokensPagination;
}

export interface IssuedTokensApiResponse {
  success: boolean;
  message: string;
  data: IssuedToken[];
  pagination?: IssuedTokensPagination;
}

export interface IssuedTokenApiResponse {
  success: boolean;
  message: string;
  data: IssuedToken;
}