
import api from "@/axios/axios";

import type {
  Devotee,
  DevoteeFormData,
  DevoteeListParams,
  DevoteeListResponse,
  DevoteeResponse,
} from "../devoteeTypes";

const API_URL = "/v1/devotees";

export const devoteeService = {
  // Get all devotees
  async getAll(params: DevoteeListParams = {}) {
    const response = await api.get<DevoteeListResponse>(API_URL, {
      params,
    });

    return response.data;
  },

  // Get devotee by ID
  async getById(id: number) {
    const response = await api.get<DevoteeResponse>(`${API_URL}/${id}`);

    return response.data.data;
  },

  // Search devotees
  async search(search: string) {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: Devotee[];
    }>(`${API_URL}/search`, {
      params: { search },
    });

    return response.data.data;
  },

  // Update devotee
  async update(id: number, data: Partial<DevoteeFormData>) {
    const response = await api.put<DevoteeResponse>(
      `${API_URL}/${id}`,
      data,
    );

    return response.data.data;
  },

  // Delete devotee
  async deleteDevotee(id: number): Promise<void> {
    await api.delete(`${API_URL}/${id}`);
  },
};
