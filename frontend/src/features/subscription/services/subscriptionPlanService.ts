



import api from "@/axios/axios"

import type {
  CreateSubscriptionPlanPayload,
  SubscriptionPlan,
  UpdateSubscriptionPlanPayload,
} from "../subscriptionPlanTypes"

const BASE_URL = "/v1/subscription-plans"

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface DeleteResponse {
  success: boolean
  message: string
}

/**
 * Get all subscription plans
 */
export const getSubscriptionPlans = () =>
  api.get<ApiResponse<SubscriptionPlan[]>>(BASE_URL)

/**
 * Get subscription plan by ID
 */
export const getSubscriptionPlanById = (id: number) =>
  api.get<ApiResponse<SubscriptionPlan>>(`${BASE_URL}/${id}`)

/**
 * Create subscription plan
 */
export const createSubscriptionPlan = (
  data: CreateSubscriptionPlanPayload,
) => {
  console.log("CREATE SUBSCRIPTION PLAN REQUEST:", data)

  return api.post<ApiResponse<SubscriptionPlan>>(
    BASE_URL,
    data,
  )
}

/**
 * Update subscription plan
 */
export const updateSubscriptionPlan = (
  id: number,
  data: UpdateSubscriptionPlanPayload,
) => {
  console.log("UPDATE SUBSCRIPTION PLAN REQUEST:", {
    id,
    data,
  })

  return api.put<ApiResponse<SubscriptionPlan>>(
    `${BASE_URL}/${id}`,
    data,
  )
}

/**
 * Delete subscription plan
 */
export const removeSubscriptionPlan = (id: number) =>
  api.delete<DeleteResponse>(`${BASE_URL}/${id}`)

