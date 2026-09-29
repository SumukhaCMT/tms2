import { useEffect, useState } from "react"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { usePermission } from "@/permissions/usePermission"

import { PAGE_SIZE, type InventoryApiRow, type InventoryRow } from "./inventoryListTypes"

function formatDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"
  return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function mapInventoryRow(row: InventoryApiRow): InventoryRow {
  return {
    id: row.id,
    dbId: row.id,
    itemName: row.inventory_item_name,
    itemType: row.inventory_item_type,
    stock: Number(row.inventory_stock_quantity) || 0,
    stockLeft: Number(row.stock_left) || 0,
    date: formatDate(row.inventory_created_at),
    templeName: row.temp_name,
    createdByName: row.created_by_name ?? "-",
  }
}

export function useInventoryList() {
  const [inventory, setInventory] = useState<InventoryRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const canAdd = usePermission("inventory", "ADD")
  const canEdit = usePermission("inventory", "EDIT")
  const canDelete = usePermission("inventory", "DELETE")

  useEffect(() => {
    let isCancelled = false

    async function loadInitialInventory() {
      setIsLoading(true)
      try {
        const response = await api.get("/v1/inventory")
        const rows = (response.data?.data ?? []) as InventoryApiRow[]
        if (!isCancelled) setInventory(rows.map(mapInventoryRow))
      } catch (error) {
        console.error("GET INVENTORY ERROR:", error)
        if (!isCancelled) showCmtToast("expiry", "Failed to load inventory. Please try again.")
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    void loadInitialInventory()

    return () => {
      isCancelled = true
    }
  }, [])

  const totalPages = Math.max(1, Math.ceil(inventory.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const currentInventory = inventory.slice(startIndex, endIndex)

  function handlePageChange(page: number) {
    setCurrentPage(page)
  }

  function handlePrevPage() {
    setCurrentPage((page) => Math.max(1, page - 1))
  }

  function handleNextPage() {
    setCurrentPage((page) => Math.min(totalPages, page + 1))
  }

  async function handleDelete(row: InventoryRow) {
    const confirmed = window.confirm(`Delete "${row.itemName}"? This cannot be undone.`)
    if (!confirmed) return

    try {
      await api.delete(`/v1/inventory/${row.dbId}`)
      setInventory((prev) => prev.filter((existing) => existing.dbId !== row.dbId))
      showCmtToast("success", "Inventory item deleted successfully.")
    } catch (error) {
      console.error("DELETE INVENTORY ERROR:", error)
      showCmtToast("expiry", "Failed to delete the inventory item. Please try again.")
    }
  }

  async function handleDownloadReceipt(row: InventoryRow) {
    setDownloadingId(row.dbId)
    try {
      const response = await api.get(`/v1/inventory/${row.dbId}/receipt`, { responseType: "blob" })
      const blob = new Blob([response.data], { type: "application/pdf" })
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `Inventory-Receipt-${row.itemName}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()

      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch (error) {
      console.error("DOWNLOAD INVENTORY RECEIPT ERROR:", error)
      showCmtToast("expiry", "Failed to download the receipt. Please try again.")
    } finally {
      setDownloadingId(null)
    }
  }

  return {
    inventory,
    isLoading,
    currentPage,
    downloadingId,
    canAdd,
    canEdit,
    canDelete,
    totalPages,
    startIndex,
    endIndex,
    currentInventory,
    handlePageChange,
    handlePrevPage,
    handleNextPage,
    handleDelete,
    handleDownloadReceipt,
  }
}
