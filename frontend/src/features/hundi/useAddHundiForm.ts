import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { z } from "zod"

import api from "@/axios/axios"
import { useAuth } from "@/features/auth/useAuth"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { normalizeAmount } from "@/features/inventory/shared/measurementMath"

import type {
  BasicDetailsForm,
  PhysicalItemForm,
  DenominationRow,
  DenominationOption,
  DeityOption,
  TempleOption,
  MeasurementUnitOption,
  CreatedHundi,
  FormErrors,
} from "./shared/hundiFormTypes"
import {
  collectZodErrors,
  physicalItemSchema,
  emptyPhysicalItem,
  buildHundiSummary,
  toApiDateTime,
} from "./shared/hundiFormLogic"
import { toWitnessPayload, useWitnessList } from "./shared/useWitnessList"

function emptyBasicDetails(): BasicDetailsForm {
  return {
    openedAt: "",
    templeId: "",
    deityIds: [],
  }
}

const basicDetailsSchema = z.object({
  openedAt: z
    .string()
    .trim()
    .min(1, "Opened at date is required")
    .refine((value) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value), "Pick both a date and a time"),
  deityIds: z.array(z.string()).min(1, "Select at least one deity"),
})

export function useAddHundiForm() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const isOrgAdmin = !!user?.organization_id && !user?.temple_id

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1)
  const [basic, setBasic] = useState<BasicDetailsForm>(() => emptyBasicDetails())
  const witnessList = useWitnessList()
  const [denominations, setDenominations] = useState<DenominationRow[]>([])
  const [items, setItems] = useState<PhysicalItemForm[]>(() => [emptyPhysicalItem()])
  const [image, setImage] = useState<File | null>(null)
  const [generalRemark, setGeneralRemark] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const [createdHundis, setCreatedHundis] = useState<CreatedHundi[] | null>(null)
  const [receiptActionLoading, setReceiptActionLoading] = useState<string | null>(null)
  const [uploadingSignedId, setUploadingSignedId] = useState<number | null>(null)
  const [signedUploadedIds, setSignedUploadedIds] = useState<number[]>([])

  const [organizationName, setOrganizationName] = useState("")
  const [temples, setTemples] = useState<TempleOption[]>([])
  const [deities, setDeities] = useState<DeityOption[]>([])
  const [measurementUnits, setMeasurementUnits] = useState<MeasurementUnitOption[]>([])

  const effectiveTempleId = isOrgAdmin ? (Number(basic.templeId) || null) : (user?.temple_id ?? null)

  const templeName = isOrgAdmin
    ? temples.find((temple) => String(temple.id) === basic.templeId)?.temp_name ?? ""
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
        const res = await api.get("/v1/hundi/temples")
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
    async function loadDeities() {
      if (effectiveTempleId === null) {
        setDeities([])
        return
      }
      try {
        const res = await api.get("/v1/hundi/deities", {
          params: isOrgAdmin ? { temple_id: effectiveTempleId } : undefined,
        })
        const data = res?.data?.data
        if (active && Array.isArray(data)) setDeities(data)
      } catch {
        void 0
      }
    }
    loadDeities()
    return () => {
      active = false
    }
  }, [effectiveTempleId, isOrgAdmin])

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
    let active = true
    async function loadDenominations() {
      try {
        const res = await api.get("/v1/hundi/denominations")
        const data = res?.data?.data as DenominationOption[] | undefined
        if (active && Array.isArray(data)) {
          setDenominations(
            data.map((option) => ({
              id: option.id,
              value: Number(option.denomination),
              type: option.type,
              quantity: "",
            })),
          )
        }
      } catch {
        void 0
      }
    }
    loadDenominations()
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

  function updateBasic<K extends keyof BasicDetailsForm>(field: K, value: BasicDetailsForm[K]) {
    setBasic((prev) => ({ ...prev, [field]: value }))
    clearError(field)
    if (field === "templeId") {
      setBasic((prev) => ({ ...prev, deityIds: [] }))
    }
  }



  function updateItem<K extends keyof PhysicalItemForm>(index: number, field: K, value: PhysicalItemForm[K]) {
    setItems((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
    clearError(`items.${index}.${field}`)
  }

  function normalizeItemMeasurement(index: number, patch: Partial<PhysicalItemForm> = {}) {
    const row = { ...items[index], ...patch }
    const unit = measurementUnits.find((option) => option.unit_name === row.measurement)
    const result = normalizeAmount(row.measurementWeight, unit, measurementUnits)
    if (!result) return
    setItems((prev) =>
      prev.map((current, i) => (i === index ? { ...current, measurementWeight: result.value, measurement: result.unit.unit_name } : current)),
    )
  }

  function addItem() {
    setItems((prev) => [...prev, emptyPhysicalItem()])
  }

  function removeItem(index: number) {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [emptyPhysicalItem()]))
  }

  function updateDenominationQuantity(id: number, quantity: string) {
    setDenominations((prev) => prev.map((row) => (row.id === id ? { ...row, quantity } : row)))
  }


  function validateBasicDetails(): boolean {
    const result = basicDetailsSchema.safeParse(basic)
    const fieldErrors = collectZodErrors(result)

    if (isOrgAdmin && !basic.templeId) {
      fieldErrors.templeId = "Please select a temple"
    }

    setErrors((prev) => ({ ...prev, ...fieldErrors }))
    return Object.keys(fieldErrors).length === 0
  }


  function validatePhysicalItems(): boolean {
    const fieldErrors: FormErrors = {}
    items.forEach((row, index) => {
      const rowErrors = collectZodErrors(physicalItemSchema.safeParse(row))
      for (const key of Object.keys(rowErrors)) {
        fieldErrors[`items.${index}.${key}`] = rowErrors[key]
      }
    })
    setErrors((prev) => ({ ...prev, ...fieldErrors }))
    return Object.keys(fieldErrors).length === 0
  }

  function handleNext() {
    if (step === 1) {
      if (validateBasicDetails()) setStep(2)
      return
    }
    if (step === 2) {
      if (witnessList.validate()) setStep(3)
      return
    }
    if (step === 3) {
      setStep(4)
      return
    }
    if (step === 4) {
      if (validatePhysicalItems()) setStep(5)
      return
    }
    if (step === 5) {
      setStep(6)
    }
  }

  function handleBack() {
    if (step > 1) setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5)
  }

  function goToReview() {
    setStep(6)
  }

  function buildFormData(): FormData {
    const formData = new FormData()

    formData.append("opened_at", toApiDateTime(basic.openedAt))
    if (isOrgAdmin && effectiveTempleId) {
      formData.append("temple_id", String(effectiveTempleId))
    }
    formData.append("deity_ids", JSON.stringify(basic.deityIds.map(Number)))

    formData.append("witness", JSON.stringify(toWitnessPayload(witnessList.witnesses[0])))
    formData.append("extra_witnesses", JSON.stringify(witnessList.witnesses.slice(1).map(toWitnessPayload)))

    const denominationPayload = denominations
      .filter((row) => Number(row.quantity) > 0)
      .map((row) => ({
        denomination_id: row.id,
        quantity: Number(row.quantity),
      }))
    formData.append("denominations", JSON.stringify(denominationPayload))

    const itemsPayload = items
      .filter((row) => row.itemName.trim())
      .map((row) => ({
        item_name: row.itemName.trim(),
        measurement_weight: row.measurementWeight ? Number(row.measurementWeight) : null,
        measurement: row.measurement.trim() || null,
        quantity: row.quantity ? Number(row.quantity) : 1,
        approximate_value: row.approximateValue ? Number(row.approximateValue) : null,
        exact_value: row.exactValue ? Number(row.exactValue) : null,
      }))
    formData.append("items", JSON.stringify(itemsPayload))

    formData.append("summary", buildHundiSummary(denominations, items))
    formData.append("general_remark", generalRemark.trim())

    if (image) {
      formData.append("hundi_image", image)
    }

    return formData
  }

  async function handleSubmit() {
    if (!validateBasicDetails() || !witnessList.validate() || !validatePhysicalItems()) {
      setStep(1)
      return
    }

    setSubmitting(true)
    try {
      const res = await api.post("/v1/hundi", buildFormData())
      const created = (res?.data?.data?.created ?? []) as CreatedHundi[]
      showCmtToast("success", "Hundi opening recorded successfully.")
      if (created.length) {
        setCreatedHundis(created)
      } else {
        navigate("/hundi")
      }
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to save the hundi opening. Please try again."
      showCmtToast("expiry", message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReceiptAction(hundiId: number, mode: "download" | "print") {
    const key = `${hundiId}-${mode}`
    setReceiptActionLoading(key)
    try {
      const res = await api.get(`/v1/hundi/${hundiId}/receipt`, { responseType: "blob" })
      const blob = new Blob([res.data], { type: "application/pdf" })
      const blobUrl = URL.createObjectURL(blob)

      if (mode === "download") {
        const link = document.createElement("a")
        link.href = blobUrl
        link.download = `Hundi-Receipt-${hundiId}.pdf`
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

  async function handleUploadSignedReceipt(hundiId: number, file: File) {
    setUploadingSignedId(hundiId)
    try {
      const uploadData = new FormData()
      uploadData.append("signed_receipt", file)
      await api.post(`/v1/hundi/${hundiId}/signed-receipt`, uploadData)
      setSignedUploadedIds((prev) => (prev.includes(hundiId) ? prev : [...prev, hundiId]))
      showCmtToast("success", "Signed receipt uploaded successfully.")
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to upload the signed receipt. Please try again."
      showCmtToast("expiry", message)
    } finally {
      setUploadingSignedId(null)
    }
  }

  function goToHundiList() {
    navigate("/hundi")
  }

  return {
    isOrgAdmin,
    step,
    basic,
    witnessList,
    denominations,
    items,
    image,
    generalRemark,
    errors,
    submitting,
    createdHundis,
    receiptActionLoading,
    uploadingSignedId,
    signedUploadedIds,
    organizationName,
    temples,
    deities,
    measurementUnits,
    templeName,
    setImage,
    setGeneralRemark,
    updateBasic,
    updateItem,
    addItem,
    normalizeItemMeasurement,
    removeItem,
    updateDenominationQuantity,
    handleNext,
    handleBack,
    goToReview,
    handleSubmit,
    handleReceiptAction,
    handleUploadSignedReceipt,
    goToHundiList,
  }
}
