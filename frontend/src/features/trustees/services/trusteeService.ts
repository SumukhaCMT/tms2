

import { isAxiosError } from "axios";

import api from "@/axios/axios";

import type {
  CreateTrusteePayload,
  Trustee,
  TrusteeListQuery,
  TrusteeListResponse,
  UpdateTrusteePayload,
} from "../trusteeTypes";

const API_URL = "/v1/trustees";

function getErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: string; error?: string }>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Request failed"
    );
  }

  return error instanceof Error
    ? error.message
    : "Something went wrong";
}

function normalizeListResponse(
  response: unknown,
): TrusteeListResponse {
  const result = response as {
    success?: boolean;
    data?: Trustee[];
    trustees?: Trustee[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    pagination?: {
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    };
  };

  const rows = Array.isArray(result.data)
    ? result.data
    : Array.isArray(result.trustees)
      ? result.trustees
      : [];

  const pagination = result.pagination;

  const total = pagination?.total ?? result.total ?? rows.length;
  const page = pagination?.page ?? result.page ?? 1;
  const limit = pagination?.limit ?? result.limit ?? rows.length;

  return {
    success: result.success ?? true,
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages:
        pagination?.totalPages ??
        result.totalPages ??
        Math.max(1, Math.ceil(total / Math.max(limit, 1))),
    },
  };
}

export const trusteeService = {
  async getAll(
    query: TrusteeListQuery = {},
  ): Promise<TrusteeListResponse> {
    try {
      const response = await api.get(API_URL, {
        params: query,
      });

      return normalizeListResponse(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error), {
        cause: error,
      });
    }
  },

  async getById(id: number): Promise<Trustee> {
    try {
      const response = await api.get(`${API_URL}/${id}`);

      return (
        response.data.data ??
        response.data.trustee ??
        response.data
      ) as Trustee;
    } catch (error) {
      throw new Error(getErrorMessage(error), {
        cause: error,
      });
    }
  },

  async create(
    payload: CreateTrusteePayload,
  ): Promise<Trustee> {
    try {
      const response = await api.post(API_URL, payload);

      return (
        response.data.data ??
        response.data.trustee ??
        response.data
      ) as Trustee;
    } catch (error) {
      throw new Error(getErrorMessage(error), {
        cause: error,
      });
    }
  },

  async update(
    id: number,
    payload: UpdateTrusteePayload,
  ): Promise<Trustee> {
    try {
      const response = await api.put(`${API_URL}/${id}`, payload);

      return (
        response.data.data ??
        response.data.trustee ??
        response.data
      ) as Trustee;
    } catch (error) {
      throw new Error(getErrorMessage(error), {
        cause: error,
      });
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`${API_URL}/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error), {
        cause: error,
      });
    }
  },
};
