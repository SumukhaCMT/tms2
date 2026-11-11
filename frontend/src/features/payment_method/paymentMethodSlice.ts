
import { createSlice } from "@reduxjs/toolkit"

import type { PaymentMethodsState } from "./paymentMethodTypes"

import {
  fetchPaymentMethods,
  fetchPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from "./PaymentMethodThunks"

const initialState: PaymentMethodsState = {
  items: [],
  selectedPaymentMethod: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
}

const paymentMethodSlice = createSlice({
  name: "paymentMethods",
  initialState,
  reducers: {
    clearSelectedPaymentMethod(state) {
      state.selectedPaymentMethod = null
    },
    clearPaymentMethodError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.data ?? []

        if (action.payload.pagination) {
          state.pagination = action.payload.pagination
        } else {
          state.pagination = {
            page: 1,
            limit: state.items.length || 10,
            total: state.items.length,
            totalPages: state.items.length ? 1 : 0,
          }
        }
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload ?? "Failed to load payment methods."
      })

      .addCase(fetchPaymentMethodById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPaymentMethodById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedPaymentMethod = action.payload
      })
      .addCase(fetchPaymentMethodById.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload ?? "Failed to load payment method."
      })

      .addCase(createPaymentMethod.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.pagination.total += 1
        state.error = null
      })
      .addCase(createPaymentMethod.rejected, (state, action) => {
        state.error =
          action.payload ?? "Failed to create payment method."
      })

      .addCase(updatePaymentMethod.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        )

        if (index !== -1) {
          state.items[index] = action.payload
        }

        state.selectedPaymentMethod = action.payload
        state.error = null
      })
      .addCase(updatePaymentMethod.rejected, (state, action) => {
        state.error =
          action.payload ?? "Failed to update payment method."
      })

      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.id !== action.payload,
        )
        state.pagination.total = Math.max(
          0,
          state.pagination.total - 1,
        )
        state.error = null
      })
      .addCase(deletePaymentMethod.rejected, (state, action) => {
        state.error =
          action.payload ?? "Failed to delete payment method."
      })
  },
})

export const {
  clearSelectedPaymentMethod,
  clearPaymentMethodError,
} = paymentMethodSlice.actions

export default paymentMethodSlice.reducer