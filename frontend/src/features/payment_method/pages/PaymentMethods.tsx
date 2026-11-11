
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
// import { useNavigate } from "react-router-dom"

// import { Button } from "@/components/ui/button"
import type { AppDispatch } from "@/app/store"

import PaymentMethodsTable from "../components/PaymentMethodTable"
import { fetchPaymentMethods } from "../PaymentMethodThunks"
import {
  selectPaymentMethods,
  selectPaymentMethodsLoading,
  selectPaymentMethodsError,
} from "../PaymentMethodSelectors"

export default function PaymentMethods() {
  const dispatch = useDispatch<AppDispatch>()
  // const navigate = useNavigate()

  const items = useSelector(selectPaymentMethods)
  const loading = useSelector(selectPaymentMethodsLoading)
  const error = useSelector(selectPaymentMethodsError)

  useEffect(() => {
    void dispatch(fetchPaymentMethods())
  }, [dispatch])

  return (
    <div className="w-full space-y-6">
     

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <PaymentMethodsTable
        items={items}
        loading={loading}
        onRefresh={() => {
          void dispatch(fetchPaymentMethods())
        }}
      />
    </div>
  )
}