import { useEffect, useState } from "react"

import api from "@/axios/axios"
import { toTime, useSort } from "@/hooks/useSort"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { usePermission } from "@/permissions/usePermission"

import type { InventoryUsedListItemApi } from "./inventoryUsageTypes"
import { confirmDelete } from "@/components/confirm-delete"
import { bulkDelete } from "@/utils/bulkDelete"

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
  const [search, setSearch] = useState("")

  useEffect(() => {
    let isCancelled = false

    async function loadInitialRows() {
      setIsLoading(true)
      try {
        const res = await api.get("/v1/inventory-used", { params: search ? { search } : undefined })
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
  }, [search])

  async function handleDelete(row: InventoryUsedListItemApi) {
    const confirmed = await confirmDelete(`Delete this usage record (${row.transaction_number}) for ${row.item_name}? This cannot be undone.`, "Delete usage record?")
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

  async function handleBulkDelete(ids: number[]) {
    const names = rows.filter((row) => ids.includes(row.id)).map((row) => `${row.transaction_number} · ${row.item_name}`)
    const deleted = await bulkDelete(ids, "/v1/inventory-used", "usage records", names)
    if (deleted.length) setRows((prev) => prev.filter((row) => !deleted.includes(row.id)))
    return deleted.length > 0
  }

  const { sorted, sort, setSort } = useSort(rows, {
    totalStock: (row) => row.total_stock,
    usedDate: (row) => toTime(row.used_date),
  })

  return {
    canAdd,
    canEdit,
    canDelete,
    rows: sorted,
    sort,
    handleSort: setSort,
    isLoading,
    handleDelete,
    handleBulkDelete,
    search,
    handleSearch: setSearch,
  }
}
