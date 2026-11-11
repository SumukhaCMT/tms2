
import type { PaymentMethodFormData } from "./paymentMethodValidation"

export interface PaymentMethod extends PaymentMethodFormData {
  id: number;
  temple_name:string

}

export type CreatePaymentMethodPayload = PaymentMethodFormData

export type UpdatePaymentMethodPayload =
  Partial<PaymentMethodFormData>

export interface PaymentMethodsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaymentMethodsState {
  items: PaymentMethod[]
  selectedPaymentMethod: PaymentMethod | null
  loading: boolean
  error: string | null
  pagination: PaymentMethodsPagination
}

export interface PaymentMethodsQuery {
  page?: number
  limit?: number
  search?: string
  temple_id?: number
}