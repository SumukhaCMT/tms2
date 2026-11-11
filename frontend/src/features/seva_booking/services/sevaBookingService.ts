import api from "@/axios/axios";

import type {
  SevaBooking,
  CreateSevaBookingPayload,
  UpdateSevaBookingPayload,
  SevaBookingListQuery,
  SevaBookingListResult,
} from "../sevaBookingTypes";

const API_URL = "/v1/seva-bookings";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: SevaBookingListResult["pagination"];
}

export const sevaBookingService = {
  async getAll(
    query: SevaBookingListQuery,
  ): Promise<SevaBookingListResult> {
    const response = await api.get<
      ApiResponse<SevaBooking[]> | ApiResponse<SevaBookingListResult>
    >(API_URL, { params: query });

    const body = response.data;

    if (Array.isArray(body.data)) {
      return {
        data: body.data,
        pagination: body.pagination ?? {
          page: query.page,
          limit: query.limit,
          total: body.data.length,
          totalPages: Math.ceil(body.data.length / query.limit),
        },
      };
    }

    return body.data;
  },

  async getById(id: number): Promise<SevaBooking> {
    const response = await api.get<ApiResponse<SevaBooking>>(
      `${API_URL}/${id}`,
    );

    return response.data.data;
  },

  async create(
    payload: CreateSevaBookingPayload,
  ): Promise<SevaBooking> {
    const response = await api.post<ApiResponse<SevaBooking>>(
      API_URL,
      payload,
    );

    return response.data.data;
  },

  async update(
    id: number,
    payload: UpdateSevaBookingPayload,
  ): Promise<SevaBooking> {
    const response = await api.put<ApiResponse<SevaBooking>>(
      `${API_URL}/${id}`,
      payload,
    );

    return response.data.data;
  },

  async remove(id: number): Promise<number> {
    await api.delete(`${API_URL}/${id}`);
    return id;
  },
  
  async printReceipt(id: number): Promise<string> {
  const response = await api.get<
    ApiResponse<{ html: string; printType: string }>
  >(`${API_URL}/${id}/receipt/print`);

  const html = response.data.data?.html;

  if (!html) {
    throw new Error("Receipt HTML was not returned by the server.");
  }

  return html;
},

async exportReport(params: {
  from_date: string;
  to_date: string;
  format: "excel" | "pdf";
}): Promise<Blob> {
  const response = await api.get(
    `${API_URL}/report/export`,
    {
      params,
      responseType: "blob",
    },
  );

  return response.data as Blob;
},
};