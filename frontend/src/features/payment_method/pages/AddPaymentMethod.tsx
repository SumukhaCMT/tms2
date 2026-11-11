



import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { AlertCircle } from "lucide-react"

import type { AppDispatch } from "@/app/store"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

import { Button } from "@/components/ui/button"

import PaymentMethodForm from "../components/PaymentMethodForm"
import { createPaymentMethod } from "../PaymentMethodThunks"

import { fetchTemples } from "../../temple/templeThunks"
import { showCmtToast } from "@/components/ui/cmt-toast"
import {
  selectTemples,
  selectTempleLoading,
  selectTempleError,
} from "../../temple/templeSelectors"

export default function AddPaymentMethod() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const [error, setError] = useState("")

  const temples = useSelector(selectTemples)
  const templesLoading = useSelector(selectTempleLoading)
  const templesError = useSelector(selectTempleError)

  useEffect(() => {
    void dispatch(fetchTemples())
  }, [dispatch])

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
           Payment Method
        </h1>

        <p className="text-sm text-muted-foreground">
          Configure a payment method for a temple.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>
            Unable to Create Payment Method
          </AlertTitle>
          <AlertDescription>{error}</AlertDescription>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setError("")}
          >
            Dismiss
          </Button>
        </Alert>
      )}

      {templesError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Unable to Load Temples</AlertTitle>
          <AlertDescription>{templesError}</AlertDescription>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void dispatch(fetchTemples())}
          >
            Try Again
          </Button>
        </Alert>
      )}

      <PaymentMethodForm
        temples={temples}
        templesLoading={templesLoading}
        onSubmit={async (data) => {
          setError("")

          try {
            await dispatch(createPaymentMethod(data)).unwrap()
            showCmtToast("success", "Payment method created successfully.")
            navigate("/payment_methods")
          } catch (err: unknown) {
            setError(
              typeof err === "string"
                ? err
                : err instanceof Error
                  ? err.message
                  : "Failed to create payment method.",
            )
          }
        }}
        onCancel={() => navigate("/payment_methods")}
      />
    </div>
  )
}

