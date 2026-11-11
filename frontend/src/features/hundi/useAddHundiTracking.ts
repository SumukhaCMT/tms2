import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { z } from "zod"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"

import {
  emptyHundiTrackingForm,
  type IncompleteHundiApiRow,
  type DepositedByOption,
  type HundiTrackingForm,
  type FormErrors,
} from "./hundiTrackingTypes"

function mapIncompleteHundi(row: IncompleteHundiApiRow): IncompleteHundiApiRow {
  return {
    ...row,
    total_cash: Number(row.total_cash) || 0,
    deposited_amount: Number(row.deposited_amount) || 0,
    remaining_amount: Number(row.remaining_amount) || 0,
  }
}

const trackingSchema = z.object({
  hundiId: z.string().trim().min(1, "Select a hundi"),
  ifscCode: z.string().trim().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code"),
  bankName: z.string().trim().min(1, "Bank name could not be resolved from the IFSC code"),
  accountNumber: z.string().trim().min(6, "Enter a valid account number"),
  accountHolderName: z.string().trim().min(1, "Account holder name is required"),
  transactionNumber: z.string().trim().min(1, "Transaction number is required"),
  depositAmount: z
    .string()
    .trim()
    .refine((value) => Number(value) > 0, "Enter a valid deposit amount"),
  depositDate: z.string().trim().min(1, "Deposit date is required"),
})

export function useAddHundiTracking() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [incompleteHundis, setIncompleteHundis] = useState<IncompleteHundiApiRow[]>([])
  const [loadingHundis, setLoadingHundis] = useState(true)
  const [form, setForm] = useState<HundiTrackingForm>(() => emptyHundiTrackingForm())
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const selectedHundi = incompleteHundis.find((hundi) => String(hundi.id) === form.hundiId) ?? null

  useEffect(() => {
    let isCancelled = false

    async function loadInitialHundis() {
      setLoadingHundis(true)
      try {
        const res = await api.get("/v1/hundi-tracking/incomplete-hundis")
        const data = res?.data?.data
        if (!isCancelled && Array.isArray(data)) setIncompleteHundis(data.map(mapIncompleteHundi))
      } catch (error) {
        console.error("GET INCOMPLETE HUNDIS ERROR:", error)
      } finally {
        if (!isCancelled) setLoadingHundis(false)
      }
    }

    void loadInitialHundis()

    return () => {
      isCancelled = true
    }
  }, [])

  function clearError(field: string) {
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function updateForm<K extends keyof HundiTrackingForm>(field: K, value: HundiTrackingForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    clearError(field as string)
  }

  function handleHundiChange(hundiId: string) {
    setForm((prev) => ({
      ...prev,
      hundiId,
      depositedById: null,
      depositedByQuery: "",
    }))
    clearError("hundiId")
  }

  function handleIfscResolved(bankName: string | null) {
    setForm((prev) => ({ ...prev, bankName: bankName ?? "" }))
    if (bankName) clearError("bankName")
  }

  function handleDepositedByQueryChange(value: string) {
    updateForm("depositedByQuery", value)
  }

  function handleDepositedBySelect(option: DepositedByOption | null) {
    setForm((prev) => ({ ...prev, depositedById: option?.id ?? null }))
    clearError("depositedById")
  }

  function validate(): boolean {
    const result = trackingSchema.safeParse(form)
    const fieldErrors: FormErrors = {}
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = String(issue.path[0])
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
    }
    if (!form.depositedById) {
      fieldErrors.depositedById = "Search and select who deposited this"
    }
    if (!fieldErrors.depositAmount && selectedHundi && Number(form.depositAmount) > selectedHundi.remaining_amount) {
      fieldErrors.depositAmount = `Cannot exceed the remaining balance of ₹${selectedHundi.remaining_amount.toFixed(2)}`
    }
    setErrors(fieldErrors)
    return Object.keys(fieldErrors).length === 0
  }

  function handleNext() {
    if (!validate()) return
    setStep(2)
  }

  function handleBack() {
    setStep(1)
  }

  async function handleSubmit() {
    if (!validate()) {
      setStep(1)
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        hundi_id: Number(form.hundiId),
        ifsc_code: form.ifscCode,
        bank_name: form.bankName,
        account_number: form.accountNumber.trim(),
        account_holder_name: form.accountHolderName.trim(),
        transaction_number: form.transactionNumber.trim(),
        deposit_amount: Number(form.depositAmount),
        deposit_date: form.depositDate,
        remarks: form.remarks.trim() || undefined,
        deposited_by_id: form.depositedById,
      }

      await api.post("/v1/hundi-tracking", payload)
      showCmtToast("success", "Deposit recorded successfully.")

      navigate("/hundi/tracking")
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to record the deposit. Please try again."
      showCmtToast("expiry", message)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    step,
    incompleteHundis,
    loadingHundis,
    selectedHundi,
    form,
    errors,
    submitting,
    updateForm,
    handleHundiChange,
    handleIfscResolved,
    handleDepositedByQueryChange,
    handleDepositedBySelect,
    handleNext,
    handleBack,
    handleSubmit,
  }
}
