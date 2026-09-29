import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { z } from "zod"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"

import {
  emptyHundiTrackingForm,
  type HundiBankDepositDetailApiRow,
  type DepositedByOption,
  type HundiTrackingForm,
  type FormErrors,
} from "./hundiTrackingTypes"

function mapDepositDetail(row: HundiBankDepositDetailApiRow): HundiBankDepositDetailApiRow {
  return {
    ...row,
    deposit_amount: Number(row.deposit_amount) || 0,
    total_cash: Number(row.total_cash) || 0,
    remaining_amount: Number(row.remaining_amount) || 0,
  }
}

function toDetailForm(detail: HundiBankDepositDetailApiRow): HundiTrackingForm {
  return {
    hundiId: String(detail.hundi_id),
    ifscCode: detail.ifsc_code,
    bankName: detail.bank_name,
    accountNumber: detail.account_number,
    accountHolderName: detail.account_holder_name ?? "",
    transactionNumber: detail.transaction_number ?? "",
    depositAmount: String(detail.deposit_amount),
    depositedById: detail.deposited_by,
    depositedByQuery: detail.deposited_by_name,
    depositDate: String(detail.deposit_date).slice(0, 10),
    remarks: detail.remarks ?? "",
  }
}

const trackingSchema = z.object({
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

export function useEditHundiTracking() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [step, setStep] = useState(1)
  const [detail, setDetail] = useState<HundiBankDepositDetailApiRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<HundiTrackingForm>(() => emptyHundiTrackingForm())
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function loadDetail() {
      setLoading(true)
      try {
        const res = await api.get(`/v1/hundi-tracking/${id}`)
        const data = res?.data?.data
        if (!isCancelled && data) {
          const mapped = mapDepositDetail(data)
          setDetail(mapped)
          setForm(toDetailForm(mapped))
        }
      } catch (error) {
        console.error("GET HUNDI BANK DEPOSIT ERROR:", error)
        if (!isCancelled) showCmtToast("expiry", "Failed to load this deposit record.")
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    void loadDetail()

    return () => {
      isCancelled = true
    }
  }, [id])

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
    if (!fieldErrors.depositAmount && detail && Number(form.depositAmount) > detail.remaining_amount) {
      fieldErrors.depositAmount = `Cannot exceed the remaining balance of ₹${detail.remaining_amount.toFixed(2)}`
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

      await api.put(`/v1/hundi-tracking/${id}`, payload)
      showCmtToast("success", "Deposit updated successfully.")

      navigate("/hundi/tracking")
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to update the deposit. Please try again."
      showCmtToast("expiry", message)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    step,
    detail,
    loading,
    form,
    errors,
    submitting,
    updateForm,
    handleIfscResolved,
    handleDepositedByQueryChange,
    handleDepositedBySelect,
    handleNext,
    handleBack,
    handleSubmit,
  }
}
