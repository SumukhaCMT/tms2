
import api from "@/axios/axios"

import type {
  PaymentMethod,
  CreatePaymentMethodPayload,
  UpdatePaymentMethodPayload,
  PaymentMethodsQuery,
  PaymentMethodsPagination,
} from "../paymentMethodTypes"

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  pagination?: PaymentMethodsPagination
}

const API_URL = "/v1/payment-methods"

export const paymentMethodService = {
  async getAll(params: PaymentMethodsQuery = {}) {
    const response = await api.get<ApiResponse<PaymentMethod[]>>(
      API_URL,
      { params },
    )

    return response.data
  },

  async getById(id: number) {
    const response = await api.get<ApiResponse<PaymentMethod>>(
      `${API_URL}/${id}`,
    )

    return response.data.data
  },

  async create(payload: CreatePaymentMethodPayload) {
    const response = await api.post<ApiResponse<PaymentMethod>>(
      API_URL,
      payload,
    )

    return response.data
  },

  async update(
    id: number,
    payload: UpdatePaymentMethodPayload,
  ) {
    const response = await api.put<ApiResponse<PaymentMethod>>(
      `${API_URL}/${id}`,
      payload,
    )

    return response.data
  },

  async remove(id: number) {
    const response = await api.delete<ApiResponse<null>>(
      `${API_URL}/${id}`,
    )

    return response.data
  },
}