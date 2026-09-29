import { useEffect, useState } from "react"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"

import type { InventoryViewDetail } from "./inventoryViewTypes"

interface InventoryViewState {
  id: number
  inventory: InventoryViewDetail | null
}

export function useInventoryView(inventoryId: number | null) {
  const [view, setView] = useState<InventoryViewState | null>(null)

  useEffect(() => {
    if (!inventoryId) return
    let active = true

    api
      .get(`/v1/inventory/${inventoryId}`)
      .then((res) => {
        if (active) setView({ id: inventoryId, inventory: (res.data?.data as InventoryViewDetail | undefined) ?? null })
      })
      .catch(() => {
        if (!active) return
        setView({ id: inventoryId, inventory: null })
        showCmtToast("expiry", "Failed to load the inventory details. Please try again.")
      })

    return () => {
      active = false
    }
  }, [inventoryId])

  const current = view?.id === inventoryId ? view : null
  const inventory = current?.inventory ?? null
  const totalUsed = inventory?.usages.reduce((sum, row) => sum + Number(row.used_quantity), 0) ?? 0

  return {
    inventory,
    isLoading: inventoryId !== null && !current,
    totalUsed,
  }
}
