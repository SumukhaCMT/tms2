import api from "@/axios/axios";

import type {
  CreateTokenPayload,
  FetchTokensParams,
  Token,
  TokenApiResponse,
  TokensApiResponse,
  TokensListResult,
  UpdateTokenPayload,
} from "../tokenTypes";

const API_URL = "/v1/tokens";

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

export const getTokensApi = async (
  params: FetchTokensParams
): Promise<TokensListResult> => {
  const response = await api.get<TokensApiResponse>(API_URL, {
    params: {
      page: params.page,
      limit: params.limit,
      ...(params.search?.trim()
        ? { search: params.search.trim() }
        : {}),
    },
  });

  const result = response.data;

  return {
    items: result.data,
    pagination: result.pagination ?? {
      ...DEFAULT_PAGINATION,
      page: params.page,
      limit: params.limit,
      total: result.data.length,
      totalPages: Math.max(
        1,
        Math.ceil(result.data.length / params.limit)
      ),
    },
  };
};

export const getTokenByIdApi = async (
  id: number
): Promise<Token> => {
  const response = await api.get<TokenApiResponse>(
    `${API_URL}/${id}`
  );

  return response.data.data;
};

export const createTokenApi = async (
  payload: CreateTokenPayload
): Promise<Token> => {
  const response = await api.post<TokenApiResponse>(
    API_URL,
    payload
  );

  return response.data.data;
};

export const updateTokenApi = async (
  id: number,
  payload: UpdateTokenPayload
): Promise<Token> => {
  const response = await api.put<TokenApiResponse>(
    `${API_URL}/${id}`,
    payload
  );

  return response.data.data;
};

export const deleteTokenApi = async (
  id: number
): Promise<void> => {
  await api.delete(`${API_URL}/${id}`);
};