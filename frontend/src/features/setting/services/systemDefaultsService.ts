import api from "@/axios/axios"

import type {
  CreateSystemDefaultPayload,
  SystemDefaultListParams,
  SystemDefaultListResponse,
  SystemDefaultResponse,
  UpdateSystemDefaultPayload,
} from "../systemDefaultsTypes"

const SYSTEM_DEFAULTS_API = "/v1/system-defaults"

export const systemDefaultsService = {
  getSystemDefaults: async (
    params?: SystemDefaultListParams,
  ) => {
    const response =
      await api.get<SystemDefaultListResponse>(
        SYSTEM_DEFAULTS_API,
        {
          params,
        },
      )

    return response.data
  },

  getSystemDefaultById: async (
    id: number,
  ) => {
    const response =
      await api.get<SystemDefaultResponse>(
        `${SYSTEM_DEFAULTS_API}/${id}`,
      )

    return response.data
  },

  getSystemDefaultByKey: async (
    key: string,
  ) => {
    const response =
      await api.get<SystemDefaultResponse>(
        `${SYSTEM_DEFAULTS_API}/key/${key}`,
      )

    return response.data
  },

  createSystemDefault: async (
    data: CreateSystemDefaultPayload,
  ) => {
    const response =
      await api.post<SystemDefaultResponse>(
        SYSTEM_DEFAULTS_API,
        data,
      )

    return response.data
  },

  updateSystemDefault: async (
    id: number,
    data: UpdateSystemDefaultPayload,
  ) => {
    const response =
      await api.put<SystemDefaultResponse>(
        `${SYSTEM_DEFAULTS_API}/${id}`,
        data,
      )

    return response.data
  },

  deleteSystemDefault: async (
    id: number,
  ) => {
    const response =
      await api.delete<SystemDefaultResponse>(
        `${SYSTEM_DEFAULTS_API}/${id}`,
      )

    return response.data
  },
}