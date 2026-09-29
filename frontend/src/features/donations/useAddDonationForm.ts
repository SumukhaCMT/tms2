import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { z } from "zod"

import api from "@/axios/axios"
import { useAuth } from "@/features/auth/useAuth"
import { showCmtToast } from "@/components/ui/cmt-toast"

import type {
  MonetaryDetailsForm,
  InkindDetailsForm,
  MeasurementUnitOption,
  FormErrors,
} from "./shared/donationFormTypes"
import {
  optionalEmail,
  normalizeIndiaState,
  collectZodErrors,
  monetaryDetailsSchema,
  inkindDetailsSchema,
  emptyMonetaryDetails,
  emptyInkindDetails,
} from "./shared/donationFormLogic"
import type {
  DonorDetailsForm,
  ReceiverDetailsForm,
  TempleOption,
  TempleUserOption,
  DonorSuggestion,
  SubmittedDonation,
} from "./addDonationTypes"

function generateDonationNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `DN${datePart}${randomPart}`
}

function emptyDonorDetails(): DonorDetailsForm {
  return {
    donationNumber: generateDonationNumber(),
    templeId: "",
    donorName: "",
    donorPhone: "",
    donorEmail: "",
    donorPincode: "",
    donorState: "",
    donorCity: "",
    donorAddressLine1: "",
    donorAddressLine2: "",
    donationType: "",
    storedAt: "",
    overallRemarks: "",
  }
}

function emptyReceiverDetails(): ReceiverDetailsForm {
  return {
    receiverUserId: "",
    receiverName: "",
    receiverPhone: "",
    receiverDesignation: "",
  }
}

const donorDetailsSchema = z.object({
  donationNumber: z.string().min(1),
  donorName: z.string().trim().min(4, "Donor name must be at least 4 letters"),
  donorPhone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
  donorEmail: optionalEmail("Enter a valid email address"),
  donorPincode: z
    .string()
    .trim()
    .min(1, "Pincode is required")
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode"),
  donorState: z.string().trim().min(1, "Donor state is required"),
  donorCity: z.string().trim().min(1, "Donor city is required"),
  donorAddressLine1: z.string().trim().optional(),
  donorAddressLine2: z.string().trim().optional(),
  storedAt: z.string().trim().min(1, "Stored at is required"),
  overallRemarks: z.string().trim().optional(),
})

const receiverDetailsSchema = z.object({
  receiverName: z.string().trim().optional(),
  receiverPhone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^[0-9]{10}$/.test(value), "Enter a valid 10-digit phone number"),
  receiverDesignation: z.string().trim().optional(),
})

export function useAddDonationForm() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const isOrgAdmin = !!user?.organization_id && !user?.temple_id

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [donor, setDonor] = useState<DonorDetailsForm>(() => emptyDonorDetails())
  const [monetary, setMonetary] = useState<MonetaryDetailsForm>(() => emptyMonetaryDetails())
  const [inkind, setInkind] = useState<InkindDetailsForm>(() => emptyInkindDetails())
  const [receiver, setReceiver] = useState<ReceiverDetailsForm>(() => emptyReceiverDetails())
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const [submittedDonation, setSubmittedDonation] = useState<SubmittedDonation | null>(null)
  const [receiptActionLoading, setReceiptActionLoading] = useState<"download" | "print" | null>(null)

  const [organizationName, setOrganizationName] = useState("")
  const [temples, setTemples] = useState<TempleOption[]>([])
  const [measurementUnits, setMeasurementUnits] = useState<MeasurementUnitOption[]>([])

  const effectiveTempleId = isOrgAdmin
    ? (Number(donor.templeId) || null)
    : (user?.temple_id ?? null)

  const templeName = isOrgAdmin
    ? temples.find((temple) => String(temple.id) === donor.templeId)?.temp_name ?? ""
    : user?.temple?.name ?? ""

  useEffect(() => {
    let active = true
    async function loadOrganizationName() {
      if (!user?.organization_id) return
      try {
        const res = await api.get(`/v1/organization/organizations/${user.organization_id}`)
        const data = res?.data?.data
        if (active) setOrganizationName(data?.org_name ?? data?.name ?? "")
      } catch {
        void 0
      }
    }
    loadOrganizationName()
    return () => {
      active = false
    }
  }, [user?.organization_id])

  useEffect(() => {
    if (!isOrgAdmin) return
    let active = true
    async function loadTemples() {
      try {
        const res = await api.get("/v1/donations/temples")
        const data = res?.data?.data
        if (active && Array.isArray(data)) setTemples(data)
      } catch {
        void 0
      }
    }
    loadTemples()
    return () => {
      active = false
    }
  }, [isOrgAdmin])

  useEffect(() => {
    let active = true
    async function loadMeasurementUnits() {
      try {
        const res = await api.get("/v1/inventory/measurements/units")
        const data = res?.data?.data
        if (active && Array.isArray(data)) setMeasurementUnits(data)
      } catch {
        void 0
      }
    }
    loadMeasurementUnits()
    return () => {
      active = false
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

  function updateDonor<K extends keyof DonorDetailsForm>(field: K, value: DonorDetailsForm[K]) {
    setDonor((prev) => ({ ...prev, [field]: value }))
    clearError(field)
  }

  function updateMonetary<K extends keyof MonetaryDetailsForm>(
    field: K,
    value: MonetaryDetailsForm[K]
  ) {
    setMonetary((prev) => ({ ...prev, [field]: value }))
    clearError(field)
  }

  function updateInkind<K extends keyof InkindDetailsForm>(field: K, value: InkindDetailsForm[K]) {
    setInkind((prev) => ({ ...prev, [field]: value }))
    clearError(field)
  }

  function updateReceiver<K extends keyof ReceiverDetailsForm>(
    field: K,
    value: ReceiverDetailsForm[K]
  ) {
    setReceiver((prev) => ({ ...prev, [field]: value }))
    clearError(field)
  }


  function handleSelectDonor(suggestion: DonorSuggestion) {
    setDonor((prev) => ({
      ...prev,
      donorName: suggestion.donor_name,
      donorPhone: suggestion.donor_phone ?? "",
      donorEmail: suggestion.donor_email ?? "",
      donorPincode: suggestion.donor_pincode ?? "",
      donorState: normalizeIndiaState(suggestion.donor_state ?? ""),
      donorCity: suggestion.donor_city ?? "",
      donorAddressLine1: suggestion.donor_address_line1 ?? "",
      donorAddressLine2: suggestion.donor_address_line2 ?? "",
    }))
    setErrors((prev) => {
      const next = { ...prev }
      for (const field of [
        "donorName", "donorPhone", "donorEmail", "donorPincode",
        "donorState", "donorCity", "donorAddressLine1", "donorAddressLine2",
      ]) delete next[field]
      return next
    })
  }

  function handleSelectReceiverUser(selected: TempleUserOption) {
    setReceiver({
      receiverUserId: String(selected.id),
      receiverName: selected.user_name,
      receiverPhone: selected.user_phone ?? "",
      receiverDesignation: selected.designation,
    })
    clearError("receiverName")
    clearError("receiverDesignation")
  }

  function validateDonorDetails(): boolean {
    const result = donorDetailsSchema.safeParse(donor)
    const fieldErrors = collectZodErrors(result)

    if (!donor.donationType) {
      fieldErrors.donationType = "Please select a type of donation"
    }

    if (isOrgAdmin && !donor.templeId) {
      fieldErrors.templeId = "Please select a temple"
    }

    setErrors((prev) => ({ ...prev, ...fieldErrors }))
    return Object.keys(fieldErrors).length === 0
  }

  function validateDonationDetails(): boolean {
    let valid = true
    const fieldErrors: FormErrors = {}

    if (donor.donationType === "monetary" || donor.donationType === "both") {
      const result = monetaryDetailsSchema.safeParse(monetary)
      Object.assign(fieldErrors, collectZodErrors(result))
      if (!result.success) valid = false
    }

    if (donor.donationType === "inkind" || donor.donationType === "both") {
      const result = inkindDetailsSchema.safeParse(inkind)
      Object.assign(fieldErrors, collectZodErrors(result))
      if (!result.success) valid = false
    }

    setErrors((prev) => ({ ...prev, ...fieldErrors }))
    return valid
  }

  function validateReceiverDetails(): boolean {
    const result = receiverDetailsSchema.safeParse(receiver)
    const fieldErrors = collectZodErrors(result)
    setErrors((prev) => ({ ...prev, ...fieldErrors }))
    return Object.keys(fieldErrors).length === 0
  }

  function handleNext() {
    if (step === 1) {
      if (validateDonorDetails()) setStep(2)
      return
    }
    if (step === 2) {
      if (validateDonationDetails()) setStep(3)
      return
    }
    if (step === 3) {
      if (validateReceiverDetails()) setStep(4)
    }
  }

  function handleBack() {
    if (step > 1) setStep((prev) => (prev - 1) as 1 | 2 | 3)
  }

  function goToReview() {
    setStep(3)
  }

  function buildPayload() {
    const isMonetary = donor.donationType === "monetary" || donor.donationType === "both"
    const isInkind = donor.donationType === "inkind" || donor.donationType === "both"

    const payload: Record<string, unknown> = {
      donation: {
        temple_id: effectiveTempleId,
        organization_id: user?.organization_id,
        user_id: user?.id,
        donation_number: donor.donationNumber,
        donor_name: donor.donorName.trim(),
        donor_phone: donor.donorPhone.trim(),
        donor_email: donor.donorEmail.trim() || null,
        donor_pincode: donor.donorPincode.trim(),
        donor_state: donor.donorState.trim(),
        donor_city: donor.donorCity.trim(),
        donor_address_line1: donor.donorAddressLine1.trim() || null,
        donor_address_line2: donor.donorAddressLine2.trim() || null,
        monetary: isMonetary ? 1 : 0,
        inkind: isInkind ? 1 : 0,
        stored_at: donor.storedAt.trim(),
        receiver_user_id: receiver.receiverUserId ? Number(receiver.receiverUserId) : null,
        receiver_name: receiver.receiverName.trim() || null,
        receiver_phone: receiver.receiverPhone.trim() || null,
        receiver_designation: receiver.receiverDesignation.trim() || null,
        overall_remarks: donor.overallRemarks.trim() || null,
      },
    }

    if (isMonetary) {
      payload.donation_monetary = {
        donation_method: monetary.donationMethod,
        donation_monetary_amount: Number(monetary.donationAmount),
        donation_monetary_bank_name: monetary.bankName.trim(),
        donation_monetary_reference_number: monetary.referenceNumber.trim(),
        donation_monetary_reference_date: monetary.referenceDate,
        donation_monetary_remarks: monetary.monetaryRemarks.trim() || null,
        donor_pan_number: monetary.panNumber.trim() || null,
        donor_aadhaar_number: monetary.aadhaarNumber.trim() || null,
      }
    }

    if (isInkind) {
      payload.donation_inkind = [
        {
          item_type: inkind.itemType,
          item_title: inkind.itemTitle.trim(),
          measurement: Number(inkind.measurement),
          measurement_unit: inkind.measurementUnit.trim(),
          quantity: Number(inkind.quantity),
          approximate_Market_value: inkind.approxMarketValue ? Number(inkind.approxMarketValue) : 0,
          estimated_value: inkind.estimatedValue ? Number(inkind.estimatedValue) : 0,
          remarks: inkind.inkindRemarks.trim() || null,
        },
      ]
    }

    return payload
  }

  async function handleSubmit() {
    if (!validateDonorDetails() || !validateDonationDetails() || !validateReceiverDetails()) {
      setStep(1)
      return
    }

    setSubmitting(true)
    try {
      const res = await api.post("/v1/donations", buildPayload())
      const result = res?.data?.data as { id: number; donation_number: string } | undefined
      showCmtToast("success", "Donation recorded successfully.")
      if (result?.id) {
        setSubmittedDonation({ id: result.id, donationNumber: result.donation_number })
      } else {
        navigate("/donations")
      }
    } catch {
      showCmtToast("expiry", "Failed to save the donation. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReceiptAction(mode: "download" | "print") {
    if (!submittedDonation) return

    setReceiptActionLoading(mode)
    try {
      const res = await api.get(`/v1/donations/${submittedDonation.id}/receipt`, {
        responseType: "blob",
      })
      const blob = new Blob([res.data], { type: "application/pdf" })
      const blobUrl = URL.createObjectURL(blob)

      if (mode === "download") {
        const link = document.createElement("a")
        link.href = blobUrl
        link.download = `Donation-Receipt-${submittedDonation.donationNumber}.pdf`
        document.body.appendChild(link)
        link.click()
        link.remove()
      } else {
        window.open(blobUrl, "_blank")
      }

      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch {
      showCmtToast("expiry", "Failed to load the receipt. Please try again.")
    } finally {
      setReceiptActionLoading(null)
    }
  }

  function goToDonationsList() {
    navigate("/donations")
  }

  const showMonetary = donor.donationType === "monetary" || donor.donationType === "both"
  const showInkind = donor.donationType === "inkind" || donor.donationType === "both"

  const receiverIsBlank =
    !receiver.receiverName.trim() && !receiver.receiverPhone.trim() && !receiver.receiverUserId

  return {
    isOrgAdmin,
    step,
    donor,
    monetary,
    inkind,
    receiver,
    errors,
    submitting,
    submittedDonation,
    receiptActionLoading,
    organizationName,
    temples,
    measurementUnits,
    effectiveTempleId,
    templeName,
    showMonetary,
    showInkind,
    receiverIsBlank,
    updateDonor,
    updateMonetary,
    updateInkind,
    updateReceiver,
    handleSelectDonor,
    handleSelectReceiverUser,
    handleNext,
    handleBack,
    goToReview,
    handleSubmit,
    handleReceiptAction,
    goToDonationsList,
  }
}
