
import type { RootState } from "@/app/store"

export const selectPaymentMethods = (state: RootState) =>
  state.paymentMethods.items ?? []

export const selectPaymentMethodsLoading = (state: RootState) =>
  state.paymentMethods.loading

export const selectPaymentMethodsError = (state: RootState) =>
  state.paymentMethods.error

export const selectPaymentMethodsPagination = (state: RootState) =>
  state.paymentMethods.pagination

export const selectSelectedPaymentMethod = (state: RootState) =>
  state.paymentMethods.selectedPaymentMethod