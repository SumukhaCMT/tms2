import { useEffect, useState } from "react"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { usePermission } from "@/permissions/usePermission"

import type { InventoryUsedListItemApi } from "./inventoryUsageTypes"

function mapUsedRow(row: InventoryUsedListItemApi): InventoryUsedListItemApi {
  return {
    ...row,
    total_stock: Number(row.total_stock) || 0,
    total_used: Number(row.total_used) || 0,
    total_remaining: Number(row.total_remaining) || 0,
  }
}

export function useInventoryUsage() {
  const canAdd = usePermission("inventory", "ADD")
  const canEdit = usePermission("inventory", "EDIT")
  const canDelete = usePermission("inventory", "DELETE")

  const [rows, setRows] = useState<InventoryUsedListItemApi[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false

    async function loadInitialRows() {
      setIsLoading(true)
      try {
        const res = await api.get("/v1/inventory-used")
        const data = res?.data?.data
        if (!isCancelled && Array.isArray(data)) setRows(data.map(mapUsedRow))
      } catch (error) {
        console.error("GET INVENTORY USED ERROR:", error)
        if (!isCancelled) showCmtToast("expiry", "Failed to load usage records. Please try again.")
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    void loadInitialRows()

    return () => {
      isCancelled = true
    }
  }, [])

  async function handleDelete(row: InventoryUsedListItemApi) {
    const confirmed = window.confirm(`Delete this usage record (${row.transaction_number}) for ${row.item_name}? This cannot be undone.`)
    if (!confirmed) return

    try {
      await api.delete(`/v1/inventory-used/${row.id}`)
      setRows((prev) => prev.filter((existing) => existing.id !== row.id))
      showCmtToast("success", "Usage record deleted successfully.")
    } catch (error) {
      console.error("DELETE INVENTORY USED ERROR:", error)
      showCmtToast("expiry", "Failed to delete the usage record. Please try again.")
    }
  }

  return {
    canAdd,
    canEdit,
    canDelete,
    rows,
    isLoading,
    handleDelete,
  }
}
