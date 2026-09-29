import { useEffect, useState } from "react"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { usePermission } from "@/permissions/usePermission"

import { type HundiBankDepositApiRow } from "./hundiTrackingTypes"

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

  async function loadRows() {
    setIsLoading(true)
    try {
      const res = await api.get("/v1/hundi-tracking")
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
        const res = await api.get("/v1/hundi-tracking")
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
  }, [])

  async function handleDelete(row: HundiBankDepositApiRow) {
    const confirmed = window.confirm(`Delete this deposit of ₹${row.deposit_amount.toFixed(2)} for ${row.hundi_number} - ${row.hundi_name}? This cannot be undone.`)
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

  return {
    canAdd,
    canEdit,
    canDelete,
    rows,
    isLoading,
    loadRows,
    handleDelete,
  }
}
