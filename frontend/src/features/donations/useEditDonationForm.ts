import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { z } from "zod"

import api from "@/axios/axios"
import { useAuth } from "@/features/auth/useAuth"
import { showCmtToast } from "@/components/ui/cmt-toast"

import type {
  DonationType,
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
import type { DonorDetailsForm } from "./editDonationTypes"

function emptyDonorDetails(): DonorDetailsForm {
  return {
    donationNumber: "",
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

export function useEditDonationForm() {
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [donor, setDonor] = useState<DonorDetailsForm>(() => emptyDonorDetails())
  const [monetary, setMonetary] = useState<MonetaryDetailsForm>(() => emptyMonetaryDetails())
  const [inkind, setInkind] = useState<InkindDetailsForm>(() => emptyInkindDetails())
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [loadingDonation, setLoadingDonation] = useState(true)

  const [organizationName, setOrganizationName] = useState("")
  const [measurementUnits, setMeasurementUnits] = useState<MeasurementUnitOption[]>([])

  const templeName = user?.temple?.name ?? ""

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

  useEffect(() => {
    if (!id) return
    let active = true

    async function loadDonation() {
      try {
        const res = await api.get(`/v1/donations/${id}`)
        const data = res?.data?.data

        if (!data || !active) return

        const donationType: DonationType =
          data.monetary && data.inkind ? "both" : data.inkind ? "inkind" : "monetary"

        setDonor({
          donationNumber: data.donation_number,
          donorName: data.donor_name ?? "",
          donorPhone: data.donor_phone ?? "",
          donorEmail: data.donor_email ?? "",
          donorPincode: data.donor_pincode ?? "",
          donorState: normalizeIndiaState(data.donor_state ?? ""),
          donorCity: data.donor_city ?? "",
          donorAddressLine1: data.donor_address_line1 ?? "",
          donorAddressLine2: data.donor_address_line2 ?? "",
          donationType,
          storedAt: data.stored_at ?? "",
          overallRemarks: data.overall_remarks ?? "",
        })

        if (data.donation_monetary) {
          setMonetary({
            donationMethod: data.donation_monetary.donation_method ?? "",
            donationAmount: String(data.donation_monetary.donation_monetary_amount ?? ""),
            bankName: data.donation_monetary.donation_monetary_bank_name ?? "",
            referenceNumber: data.donation_monetary.donation_monetary_reference_number ?? "",
            referenceDate: data.donation_monetary.donation_monetary_reference_date ?? "",
            monetaryRemarks: data.donation_monetary.donation_monetary_remarks ?? "",
            panNumber: data.donation_monetary.donor_pan_number ?? "",
            aadhaarNumber: data.donation_monetary.donor_aadhaar_number ?? "",
          })
        }

        const firstInkindItem = data.donation_inkind?.[0]

        if (firstInkindItem) {
          setInkind({
            itemType: firstInkindItem.item_type ?? "",
            itemTitle: firstInkindItem.item_title ?? "",
            measurement: String(firstInkindItem.measurement ?? ""),
            measurementUnit: firstInkindItem.measurement_unit ?? "",
            quantity: String(firstInkindItem.quantity ?? ""),
            approxMarketValue: firstInkindItem.approximate_Market_value
              ? String(firstInkindItem.approximate_Market_value)
              : "",
            estimatedValue: firstInkindItem.estimated_value
              ? String(firstInkindItem.estimated_value)
              : "",
            inkindRemarks: firstInkindItem.remarks ?? "",
          })
        }
      } catch {
        if (active) {
          showCmtToast("expiry", "Failed to load the donation. Please try again.")
          navigate("/donations")
        }
      } finally {
        if (active) setLoadingDonation(false)
      }
    }

    loadDonation()
    return () => {
      active = false
    }
  }, [id, navigate])

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


  function validateDonorDetails(): boolean {
    const result = donorDetailsSchema.safeParse(donor)
    const fieldErrors = collectZodErrors(result)

    if (!donor.donationType) {
      fieldErrors.donationType = "Please select a type of donation"
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

  function handleNext() {
    if (step === 1) {
      if (validateDonorDetails()) setStep(2)
      return
    }
    if (step === 2) {
      if (validateDonationDetails()) setStep(3)
    }
  }

  function handleBack() {
    if (step > 1) setStep((prev) => (prev - 1) as 1 | 2)
  }

  function goToReview() {
    setStep(2)
  }

  function buildPayload() {
    const isMonetary = donor.donationType === "monetary" || donor.donationType === "both"
    const isInkind = donor.donationType === "inkind" || donor.donationType === "both"

    const payload: Record<string, unknown> = {
      donation: {
        temple_id: user?.temple_id,
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
    if (!id) return
    if (!validateDonorDetails() || !validateDonationDetails()) {
      setStep(1)
      return
    }

    setSubmitting(true)
    try {
      await api.put(`/v1/donations/${id}`, buildPayload())
      showCmtToast("success", "Donation updated successfully.")
      navigate("/donations")
    } catch {
      showCmtToast("expiry", "Failed to update the donation. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const showMonetary = donor.donationType === "monetary" || donor.donationType === "both"
  const showInkind = donor.donationType === "inkind" || donor.donationType === "both"

  return {
    step,
    donor,
    monetary,
    inkind,
    errors,
    submitting,
    loadingDonation,
    organizationName,
    measurementUnits,
    templeName,
    showMonetary,
    showInkind,
    updateDonor,
    updateMonetary,
    updateInkind,
    handleNext,
    handleBack,
    goToReview,
    handleSubmit,
  }
}
