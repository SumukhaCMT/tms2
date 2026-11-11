import { useEffect, useState } from "react"

import api from "@/axios/axios"
import { toTime, useSort } from "@/hooks/useSort"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { usePermission } from "@/permissions/usePermission"

import { type HundiBankDepositApiRow } from "./hundiTrackingTypes"
import { confirmDelete } from "@/components/confirm-delete"
import { bulkDelete } from "@/utils/bulkDelete"

function mapDepositRow(row: HundiBankDepositApiRow): HundiBankDepositApiRow {
  return {
    ...row,
    total_cash: Number(row.total_cash) || 0,
    deposit_amount: Number(row.deposit_amount) || 0,
    remaining_amount: Number(row.remaining_amount) || 0,
  }
}

export function useHundiTracking() {
  const canAdd = usePermission("hundi", "ADD")
  const canEdit = usePermission("hundi", "EDIT")
  const canDelete = usePermission("hundi", "DELETE")

  const [rows, setRows] = useState<HundiBankDepositApiRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  async function loadRows() {
    setIsLoading(true)
    try {
      const res = await api.get("/v1/hundi-tracking", { params: search ? { search } : undefined })
      const data = res?.data?.data
      if (Array.isArray(data)) setRows(data.map(mapDepositRow))
    } catch (error) {
      console.error("GET HUNDI BANK DEPOSITS ERROR:", error)
      showCmtToast("expiry", "Failed to load tracking records. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isCancelled = false

    async function loadInitialRows() {
      setIsLoading(true)
      try {
        const res = await api.get("/v1/hundi-tracking", { params: search ? { search } : undefined })
        const data = res?.data?.data
        if (!isCancelled && Array.isArray(data)) setRows(data.map(mapDepositRow))
      } catch (error) {
        console.error("GET HUNDI BANK DEPOSITS ERROR:", error)
        if (!isCancelled) showCmtToast("expiry", "Failed to load tracking records. Please try again.")
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    void loadInitialRows()

    return () => {
      isCancelled = true
    }
  }, [search])

  async function handleDelete(row: HundiBankDepositApiRow) {
    const confirmed = await confirmDelete(`Delete this deposit of ₹${row.deposit_amount.toFixed(2)} for ${row.hundi_number} - ${row.hundi_name}? This cannot be undone.`, "Delete deposit?")
    if (!confirmed) return

    try {
      await api.delete(`/v1/hundi-tracking/${row.id}`)
      setRows((prev) => prev.filter((existing) => existing.id !== row.id))
      showCmtToast("success", "Deposit deleted successfully.")
    } catch (error) {
      console.error("DELETE HUNDI BANK DEPOSIT ERROR:", error)
      showCmtToast("expiry", "Failed to delete the deposit. Please try again.")
    }
  }

  async function handleBulkDelete(ids: number[]) {
    const names = rows.filter((row) => ids.includes(row.id)).map((row) => `${row.hundi_number} - ${row.hundi_name} · ₹${row.deposit_amount.toFixed(2)}`)
    const deleted = await bulkDelete(ids, "/v1/hundi-tracking", "deposits", names)
    if (deleted.length) setRows((prev) => prev.filter((row) => !deleted.includes(row.id)))
    return deleted.length > 0
  }

  const { sorted, sort, setSort } = useSort(rows, { depositDate: (row) => toTime(row.deposit_date) })

  return {
    canAdd,
    canEdit,
    canDelete,
    rows: sorted,
    sort,
    handleSort: setSort,
    isLoading,
    loadRows,
    handleDelete,
    handleBulkDelete,
    search,
    handleSearch: setSearch,
  }
}
