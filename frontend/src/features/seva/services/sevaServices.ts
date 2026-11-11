
import api from "@/axios/axios";

import type {
  Seva,
  CreateSevaPayload,
  UpdateSevaPayload,
  SevaListQuery,
  SevaListResult,
} from "../sevaTypes";

const API_URL = "/v1/seva";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: SevaListResult["pagination"];
}

export const sevaService = {
  async getAll(
    query: SevaListQuery,
  ): Promise<SevaListResult> {
    const response = await api.get<
      ApiResponse<Seva[]> | ApiResponse<SevaListResult>
    >(API_URL, {
      params: query,
    });

    const body = response.data;
    const result = body.data;

    // Supports either { data: Seva[], pagination }
    // or { data: { data: Seva[], pagination } }.
    if (Array.isArray(result)) {
      return {
        data: result,
        pagination: body.pagination ?? {
          page: query.page,
          limit: query.limit,
          total: result.length,
          totalPages: Math.ceil(result.length / query.limit),
        },
      };
    }

    return result;
  },

  async getById(id: number): Promise<Seva> {
    const response = await api.get<ApiResponse<Seva>>(
      `${API_URL}/${id}`,
    );

    return response.data.data;
  },

  async create(payload: CreateSevaPayload): Promise<Seva> {
    const response = await api.post<ApiResponse<Seva>>(
      API_URL,
      payload,
    );

    return response.data.data;
  },

  async update(
    id: number,
    payload: UpdateSevaPayload,
  ): Promise<Seva> {
    const response = await api.put<ApiResponse<Seva>>(
      `${API_URL}/${id}`,
      payload,
    );

    return response.data.data;
  },

  async remove(id: number): Promise<number> {
    await api.delete(`${API_URL}/${id}`);
    return id;
  },
};
