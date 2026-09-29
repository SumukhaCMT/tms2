import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

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
  FormErrors,
} from "./shared/hundiFormTypes"
import {
  collectZodErrors,
  physicalItemSchema,
  emptyPhysicalItem,
  buildHundiSummary,
  fromApiDateTime,
} from "./shared/hundiFormLogic"
import { fromWitnessApi, toWitnessPayload, useWitnessList, type WitnessApi } from "./shared/useWitnessList"

function emptyBasicDetails(): BasicDetailsForm {
  return {
    openedAt: "",
    templeId: "",
    deityIds: [],
  }
}

export function useEditHundiForm() {
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const isOrgAdmin = !!user?.organization_id && !user?.temple_id

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1)
  const [basic, setBasic] = useState<BasicDetailsForm>(() => emptyBasicDetails())
  const witnessList = useWitnessList()
  const { setWitnesses } = witnessList
  const [denominations, setDenominations] = useState<DenominationRow[]>([])
  const [items, setItems] = useState<PhysicalItemForm[]>(() => [emptyPhysicalItem()])
  const [generalRemark, setGeneralRemark] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [loadingHundi, setLoadingHundi] = useState(true)

  const [organizationName, setOrganizationName] = useState("")
  const [temples, setTemples] = useState<TempleOption[]>([])
  const [deities, setDeities] = useState<DeityOption[]>([])
  const [measurementUnits, setMeasurementUnits] = useState<MeasurementUnitOption[]>([])
  const [hundiNumber, setHundiNumber] = useState("")
  const [hundiName, setHundiName] = useState("")
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

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

    async function loadHundi() {
      try {
        const [hundiRes, catalogRes] = await Promise.all([
          api.get(`/v1/hundi/${id}`),
          api.get("/v1/hundi/denominations"),
        ])

        const data = hundiRes?.data?.data
        const catalog = (catalogRes?.data?.data ?? []) as DenominationOption[]

        if (!data || !active) return

        setBasic({
          openedAt: fromApiDateTime(data.opened_at),
          templeId: String(data.temple_id),
          deityIds: [String(data.deity_id)],
        })
        setDeities([{ id: data.deity_id, name: data.deity_name }])
        setHundiNumber(data.hundi_number)
        setHundiName(data.hundi_name)

        setWitnesses([fromWitnessApi(data), ...((data.extra_witnesses ?? []) as WitnessApi[]).map(fromWitnessApi)])

        const existingDenominations = Array.isArray(data.denominations) ? data.denominations : []
        setDenominations(
          catalog.map((option) => {
            const existing = existingDenominations.find(
              (row: { denomination_id: number }) => row.denomination_id === option.id,
            )
            return {
              id: option.id,
              value: Number(option.denomination),
              type: option.type,
              quantity: existing ? String(existing.quantity) : "",
            }
          }),
        )

        const existingItems = Array.isArray(data.items) ? data.items : []
        if (existingItems.length) {
          setItems(
            existingItems.map(
              (entry: {
                item_name: string
                measurement_weight: number | null
                measurement: string | null
                quantity: number | null
                approximate_value: number | null
                exact_value: number | null
              }) => ({
                itemName: entry.item_name ?? "",
                measurementWeight: entry.measurement_weight ? String(entry.measurement_weight) : "",
                measurement: entry.measurement ?? "",
                quantity: entry.quantity ? String(entry.quantity) : "1",
                approximateValue: entry.approximate_value ? String(entry.approximate_value) : "",
                exactValue: entry.exact_value ? String(entry.exact_value) : "",
              }),
            ),
          )
        }

        setGeneralRemark(data.general_remark ?? "")

        if (data.hundi_image) {
          try {
            const imageRes = await api.get(`/v1/hundi/${id}/image`, { responseType: "blob" })
            if (active) setImagePreviewUrl(URL.createObjectURL(imageRes.data))
          } catch {
            void 0
          }
        }
      } catch {
        if (active) {
          showCmtToast("expiry", "Failed to load the hundi. Please try again.")
          navigate("/hundi")
        }
      } finally {
        if (active) setLoadingHundi(false)
      }
    }

    loadHundi()
    return () => {
      active = false
    }
  }, [id, navigate, setWitnesses])

  function clearError(field: string) {
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
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
      setStep(2)
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
    setStep(2)
  }

  async function handleSubmit() {
    if (!id) return
    if (!witnessList.validate() || !validatePhysicalItems()) {
      setStep(2)
      return
    }

    setSubmitting(true)
    try {
      const denominationPayload = denominations
        .filter((row) => Number(row.quantity) > 0)
        .map((row) => ({
          denomination_id: row.id,
          quantity: Number(row.quantity),
        }))

      const payload: Record<string, unknown> = {
        witness: toWitnessPayload(witnessList.witnesses[0]),
        extra_witnesses: witnessList.witnesses.slice(1).map(toWitnessPayload),
        denominations: denominationPayload,
        summary: buildHundiSummary(denominations, items),
        general_remark: generalRemark.trim() || null,
        items: items
          .filter((row) => row.itemName.trim())
          .map((row) => ({
            item_name: row.itemName.trim(),
            measurement_weight: row.measurementWeight ? Number(row.measurementWeight) : null,
            measurement: row.measurement.trim() || null,
            quantity: row.quantity ? Number(row.quantity) : 1,
            approximate_value: row.approximateValue ? Number(row.approximateValue) : null,
            exact_value: row.exactValue ? Number(row.exactValue) : null,
          })),
      }

      await api.put(`/v1/hundi/${id}`, payload)
      showCmtToast("success", "Hundi updated successfully.")
      navigate("/hundi")
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to update the hundi. Please try again."
      showCmtToast("expiry", message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUploadImage(file: File) {
    setUploadingImage(true)
    try {
      const uploadData = new FormData()
      uploadData.append("hundi_image", file)
      await api.post(`/v1/hundi/${id}/image`, uploadData)
      setImagePreviewUrl(URL.createObjectURL(file))
      showCmtToast("success", "Hundi image updated successfully.")
    } catch (error) {
      console.error("UPLOAD HUNDI IMAGE ERROR:", error)
      showCmtToast("expiry", "Failed to upload the image. Please try again.")
    } finally {
      setUploadingImage(false)
    }
  }

  return {
    isOrgAdmin,
    step,
    basic,
    witnessList,
    denominations,
    items,
    generalRemark,
    errors,
    submitting,
    loadingHundi,
    organizationName,
    temples,
    deities,
    measurementUnits,
    templeName,
    hundiNumber,
    hundiName,
    imagePreviewUrl,
    uploadingImage,
    handleUploadImage,
    setGeneralRemark,
    updateItem,
    addItem,
    normalizeItemMeasurement,
    removeItem,
    updateDenominationQuantity,
    handleNext,
    handleBack,
    goToReview,
    handleSubmit,
  }
}
