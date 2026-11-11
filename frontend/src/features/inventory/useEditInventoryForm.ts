import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"

import type { InventoryGroupApi } from "./inventoryListTypes"
import { apiErrorMessage, buildInventoryPayload } from "./shared/inventoryFormLogic"
import { useInventoryWizard } from "./shared/useInventoryWizard"

export function useEditInventoryForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const wizard = useInventoryWizard()
  const { setBasics, setItems, setExtras } = wizard

  const [loadingItem, setLoadingItem] = useState(true)
  const [templeName, setTempleName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [savedId, setSavedId] = useState<number | null>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    api
      .get(`/v1/inventory/${id}/group`)
      .then((res) => {
        const group = res?.data?.data as InventoryGroupApi | undefined
        if (!group || !active) return
        setTempleName(group.temp_name)
        setBasics({ givenBy: group.given_by ?? "", givenAt: group.given_at, itemType: group.item_type })
        setExtras({ storedAt: group.stored_at ?? "", remarks: group.remarks ?? "" })
        setItems(
          group.items.map((item) => ({
            id: item.id,
            itemName: item.item_name,
            stockQuantity: String(item.stock_quantity),
            unitId: String(item.unit_id),
            measurement: item.measurement ? String(Number(item.measurement)) : "",
          })),
        )
      })
      .catch(() => {
        if (!active) return
        showCmtToast("expiry", "Failed to load the inventory. Please try again.")
        navigate("/inventory")
      })
      .finally(() => active && setLoadingItem(false))
    return () => {
      active = false
    }
  }, [id, navigate, setBasics, setExtras, setItems])

  function handleSubmit() {
    if (!id || !wizard.validateAll()) return

    setSubmitting(true)
    api
      .put(`/v1/inventory/${id}`, buildInventoryPayload(wizard.basics, wizard.items, wizard.extras))
      .then((res) => {
        showCmtToast("success", "Inventory updated successfully.")
        setSavedId(Number(res?.data?.data?.id) || Number(id))
      })
      .catch((error) => showCmtToast("expiry", apiErrorMessage(error, "Failed to update the inventory. Please try again.")))
      .finally(() => setSubmitting(false))
  }

  return {
    wizard,
    loadingItem,
    templeName,
    submitting,
    savedId,
    handleSubmit,
    goToInventoryList: () => navigate("/inventory"),
  }
}
