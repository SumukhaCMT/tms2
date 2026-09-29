import api from "@/axios/axios"

import type {
  CreateSubscriptionBundlePayload,
  SubscriptionBundle,
  SubscriptionPlan,
  UpdateSubscriptionBundlePayload,
} from "../subscriptionBundleTypes"

const BASE_URL = "/v1/subscription-bundles"

const PLAN_URL = "/api/v1/subscription-plans"

export const subscriptionBundleService = {
  async getAll(): Promise<SubscriptionBundle[]> {
    const response = await api.get(BASE_URL)

    return response.data?.data ?? response.data
  },

  async getById(id: number): Promise<SubscriptionBundle> {
    const response = await api.get(`${BASE_URL}/${id}`)

    return response.data?.data ?? response.data
  },

  async create(
    payload: CreateSubscriptionBundlePayload,
  ): Promise<SubscriptionBundle> {
    const response = await api.post(BASE_URL, payload)

    return response.data?.data ?? response.data
  },

  async update(
    id: number,
    payload: UpdateSubscriptionBundlePayload,
  ): Promise<SubscriptionBundle> {
    const response = await api.put(`${BASE_URL}/${id}`, payload)

    return response.data?.data ?? response.data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`)
  },

  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get(PLAN_URL)

    return response.data?.data ?? response.data
  },
}