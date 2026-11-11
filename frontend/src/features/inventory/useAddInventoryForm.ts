import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import api from "@/axios/axios"
import { useAuth } from "@/features/auth/useAuth"
import { showCmtToast } from "@/components/ui/cmt-toast"

import type { FormErrors, TempleOption } from "./shared/inventoryFormTypes"
import { apiErrorMessage, buildInventoryPayload } from "./shared/inventoryFormLogic"
import { useInventoryWizard } from "./shared/useInventoryWizard"

export function useAddInventoryForm() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const isOrgAdmin = !!user?.organization_id && !user?.temple_id

  const [templeId, setTempleId] = useState("")
  const [temples, setTemples] = useState<TempleOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [createdId, setCreatedId] = useState<number | null>(null)
  const [currentTempleName, setCurrentTempleName] = useState("")

  const wizard = useInventoryWizard((): FormErrors => (isOrgAdmin && !templeId ? { templeId: "Please select a temple" } : {}))

  const templeName = isOrgAdmin
    ? temples.find((temple) => String(temple.id) === templeId)?.temp_name ?? ""
    : user?.temple?.name || currentTempleName

  useEffect(() => {
    let active = true
    if (isOrgAdmin) {
      api
        .get("/v1/inventory/temples")
        .then((res) => active && Array.isArray(res?.data?.data) && setTemples(res.data.data))
        .catch(() => undefined)
    } else {
      api
        .get("/v1/inventory/current-temple")
        .then((res) => active && setCurrentTempleName(res?.data?.data?.temp_name ?? ""))
        .catch(() => undefined)
    }
    return () => {
      active = false
    }
  }, [isOrgAdmin])

  function handleSubmit() {
    if (!wizard.validateAll()) return

    setSubmitting(true)
    api
      .post("/v1/inventory", {
        temple_id: isOrgAdmin ? Number(templeId) : undefined,
        ...buildInventoryPayload(wizard.basics, wizard.items, wizard.extras),
      })
      .then((res) => {
        showCmtToast("success", "Inventory recorded successfully.")
        setCreatedId(Number(res?.data?.data?.id) || null)
      })
      .catch((error) => showCmtToast("expiry", apiErrorMessage(error, "Failed to save the inventory. Please try again.")))
      .finally(() => setSubmitting(false))
  }

  return {
    wizard,
    isOrgAdmin,
    templeId,
    setTempleId,
    temples,
    templeName,
    submitting,
    createdId,
    handleSubmit,
    goToInventoryList: () => navigate("/inventory"),
  }
}
