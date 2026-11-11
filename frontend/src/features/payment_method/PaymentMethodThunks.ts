
import { createAsyncThunk } from "@reduxjs/toolkit"

import { paymentMethodService } from "./services/paymentMethodService"
// import api from "@/axios/axios"
import type {
  PaymentMethod,
  CreatePaymentMethodPayload,
  UpdatePaymentMethodPayload,
  PaymentMethodsQuery,
} from "./paymentMethodTypes"

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: { message?: string }
        }
      }
    ).response

    if (response?.data?.message) {
      return response.data.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Something went wrong."
}

export const fetchPaymentMethods = createAsyncThunk<
  Awaited<ReturnType<typeof paymentMethodService.getAll>>,
  PaymentMethodsQuery | undefined,
  { rejectValue: string }
>(
  "paymentMethods/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      return await paymentMethodService.getAll(params)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

export const fetchPaymentMethodById = createAsyncThunk<
  PaymentMethod,
  number,
  { rejectValue: string }
>(
  "paymentMethods/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await paymentMethodService.getById(id)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

export const createPaymentMethod = createAsyncThunk<
  PaymentMethod,
  CreatePaymentMethodPayload,
  { rejectValue: string }
>(
  "paymentMethods/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await paymentMethodService.create(payload)

      if (!response.data) {
        throw new Error(
          response.message ?? "Payment method was not returned.",
        )
      }

      return response.data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

export const updatePaymentMethod = createAsyncThunk<
  PaymentMethod,
  { id: number; data: UpdatePaymentMethodPayload },
  { rejectValue: string }
>(
  "paymentMethods/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await paymentMethodService.update(id, data)

      if (!response.data) {
        throw new Error(
          response.message ?? "Updated payment method was not returned.",
        )
      }

      return response.data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

export const deletePaymentMethod = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  "paymentMethods/delete",
  async (id, { rejectWithValue }) => {
    try {
      await paymentMethodService.remove(id)
      return id
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)