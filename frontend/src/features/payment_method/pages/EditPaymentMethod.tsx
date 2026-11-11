

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { AlertCircle } from "lucide-react"

import type { AppDispatch } from "@/app/store"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

import { Button } from "@/components/ui/button"

import PaymentMethodForm from "../components/PaymentMethodForm"

import {
  fetchPaymentMethodById,
  updatePaymentMethod,
} from "../PaymentMethodThunks"

import {
  selectSelectedPaymentMethod,
  selectPaymentMethodsLoading,
  selectPaymentMethodsError,
} from "../PaymentMethodSelectors"

import { fetchTemples } from "../../temple/templeThunks"
import { showCmtToast } from "@/components/ui/cmt-toast"

import {
  selectTemples,
  selectTempleLoading,
  selectTempleError,
} from "../../temple/templeSelectors"

export default function EditPaymentMethod() {
  const { id } = useParams<{ id: string }>()
  const paymentMethodId = Number(id)

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const [submitError, setSubmitError] = useState("")

  const item = useSelector(selectSelectedPaymentMethod)
  const loading = useSelector(selectPaymentMethodsLoading)
  const fetchError = useSelector(selectPaymentMethodsError)

  const temples = useSelector(selectTemples)
  const templesLoading = useSelector(selectTempleLoading)
  const templesError = useSelector(selectTempleError)

  useEffect(() => {
    if (
      Number.isInteger(paymentMethodId) &&
      paymentMethodId > 0
    ) {
      void dispatch(fetchPaymentMethodById(paymentMethodId))
    }
  }, [dispatch, paymentMethodId])

  useEffect(() => {
    void dispatch(fetchTemples())
  }, [dispatch])

  if (
    !Number.isInteger(paymentMethodId) ||
    paymentMethodId <= 0
  ) {
    return (
      <p className="text-destructive">
        Invalid payment method ID.
      </p>
    )
  }

  if (loading && (!item || item.id !== paymentMethodId)) {
    return <p>Loading payment method...</p>
  }

  if (fetchError && (!item || item.id !== paymentMethodId)) {
    return (
      <div className="space-y-3">
        <p className="text-destructive">{fetchError}</p>

        <Button
          variant="outline"
          onClick={() =>
            void dispatch(fetchPaymentMethodById(paymentMethodId))
          }
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (!item || item.id !== paymentMethodId) {
    return <p>Payment method not found.</p>
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Edit Payment Method
        </h1>

        <p className="text-sm text-muted-foreground">
          Update the payment method details.
        </p>
      </div>

      {templesError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />

          <AlertTitle>Unable to Load Temples</AlertTitle>

          <AlertDescription>
            {templesError}
          </AlertDescription>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => void dispatch(fetchTemples())}
          >
            Try Again
          </Button>
        </Alert>
      )}

      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />

          <AlertTitle>
            Unable to Update Payment Method
          </AlertTitle>

          <AlertDescription>
            {submitError}
          </AlertDescription>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setSubmitError("")}
          >
            Dismiss
          </Button>
        </Alert>
      )}

      <PaymentMethodForm
        key={item.id}
        initialData={item}
        temples={temples}
        templesLoading={templesLoading}
        loading={loading}
        onSubmit={async (data) => {
          setSubmitError("")

          try {
            await dispatch(
              updatePaymentMethod({
                id: paymentMethodId,
                data,
              }),
            ).unwrap()

            showCmtToast("success", "Payment method updated successfully.")
            navigate("/payment_methods")
          } catch (err: unknown) {
            setSubmitError(
              typeof err === "string"
                ? err
                : err instanceof Error
                  ? err.message
                  : "Failed to update payment method.",
            )
          }
        }}
        onCancel={() => navigate("/payment_methods")}
      />
    </div>
  )
}