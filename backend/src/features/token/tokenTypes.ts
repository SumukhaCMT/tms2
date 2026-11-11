export type TokenStatus = "active" | "inactive";

export interface Token {
  id: number;
  organization_id: number;
  temple_id: number;

  // Names returned by backend JOINs
  temple_name?: string | null;
 
  // token_code: string;
  // token_name: string;
  token_code: string;
  token_name: string;

    max_limit: number | null;
  token_max_tokens: number | null;
  total_issued: number;
  token_remaining_tokens: number | null;
  // Existing fields...

  
  remaining_quantity: number | null;
  token_description: string | null;

  seva_id: number | null;
  seva_name?: string | null;

  deity_id: number | null;
  deity_name?: string | null;

  token_display_order: number;
  token_status: TokenStatus;

  created_at: string | null;
  updated_at: string | null;
  
}

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

export interface TokenListQuery {
  page: number;
  limit: number;
  search?: string;
  temple_id?: number;
  token_status?: TokenStatus;
}

/**
 * Repository result containing database rows and pagination.
 * Use data internally in the repository/service layer.
 */
export interface TokenRepositoryListResult {
  data: Token[];
  pagination: TokenPagination;
}