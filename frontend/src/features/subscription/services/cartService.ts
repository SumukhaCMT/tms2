import type { AxiosError } from "axios"

import api from "@/axios/axios"

import type { ActiveSubscription, CheckoutValues, CreditStatus, CreditType, ExpiredPlan, PlacedOrder, ServerCartItem, UpcomingPlan } from "../pricingCart"

const BASE_URL = "/v1/cart"

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface AddCartItemPayload {
  plan_id: number | null
  bundle_id: number | null
  replace_ids: number[]
}

export const getCart = () => api.get<ApiResponse<ServerCartItem[]>>(BASE_URL).then((response) => response.data.data)

export const addCartItem = ({ plan_id, bundle_id, replace_ids }: AddCartItemPayload) =>
  api
    .post<ApiResponse<ServerCartItem[]>>(`${BASE_URL}/items`, plan_id ? { plan_id, replace_ids } : { bundle_id, replace_ids })
    .then((response) => response.data.data)

export const removeCartItem = (id: number) =>
  api.delete<ApiResponse<ServerCartItem[]>>(`${BASE_URL}/items/${id}`).then((response) => response.data.data)

export const checkoutCart = (values: CheckoutValues) =>
  api.post<ApiResponse<PlacedOrder>>(`${BASE_URL}/checkout`, values).then((response) => response.data.data)

export const getActiveSubscriptions = () =>
  api.get<ApiResponse<ActiveSubscription[]>>(`${BASE_URL}/subscriptions`).then((response) => response.data.data)

export const discardCart = () => api.delete<ApiResponse<ServerCartItem[]>>(BASE_URL).then((response) => response.data.data)

export const getUpcomingPlans = () =>
  api.get<ApiResponse<UpcomingPlan[]>>(`${BASE_URL}/upcoming`).then((response) => response.data.data)

export const getExpiredPlans = () =>
  api.get<ApiResponse<ExpiredPlan[]>>(`${BASE_URL}/expired`).then((response) => response.data.data)

export const getCredits = (type: CreditType) =>
  api.get<ApiResponse<CreditStatus>>(`${BASE_URL}/credits/${type}`).then((response) => response.data.data)

export const activateCredits = (type: CreditType) =>
  api.post<ApiResponse<CreditStatus>>(`${BASE_URL}/credits/${type}/activate`).then((response) => response.data.data)

export const apiErrorMessage = (error: unknown) =>
  (error as AxiosError<{ message?: string }>).response?.data?.message ?? "Something went wrong. Please try again."
